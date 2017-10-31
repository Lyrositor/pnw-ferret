from datetime import datetime
import logging
import math
import traceback

from tornado.gen import sleep
from tornado.ioloop import IOLoop

from ferret.data import Data
from ferret.pnw.alliance import Alliance
from ferret.pnw.api import MAX_CONCURRENT_REQUESTS, get_all_alliances, \
    get_all_nations, get_alliances, get_nations, get_cities
from ferret.pnw.city import City
from ferret.pnw.nation import Nation
from ferret.pnw.stats import Stats

WAITING_PERIOD = 24 * 60 * 60


# noinspection PyBroadException
async def update_data(local, devel):

    while True:
        next_update = sleep(WAITING_PERIOD)
        logging.info(
            'Updating data {}...'.format(
                'locally' if local is not None else 'from API'
            )
        )

        # Get the connection to the database
        data = Data()

        # Get a list of all alliances and fetch their detailed information
        logging.info('\tFetching alliances')
        all_alliances = await get_all_alliances() if not devel else [
            {'id': 831}
        ]
        alliance_ids = [int(alliance['id']) for alliance in all_alliances]
        alliances = await get_in_chunk(
            Alliance, get_alliances, alliance_ids, 'allianceid'
        )

        # Fetch nations and cities in alliance batches
        all_nations = await get_all_nations() if not devel else [
            {'nationid': 81262, 'allianceid': 831}
        ]
        alliance_members = {aid: [] for aid in alliances.keys()}
        for nation in all_nations:
            if nation['allianceid'] not in alliance_members:
                continue
            alliance_members[nation['allianceid']].append(nation['nationid'])
        for alliance_id, nation_ids in alliance_members.items():
            try:
                alliance = alliances[alliance_id]
                logging.info('\tFetching members of {} (#{})'.format(
                    alliance.name, alliance_id)
                )

                # Get all the nations
                logging.info('\t\tFetching nations')
                nations, city_ids = await get_in_chunk(
                    Nation, get_nations, nation_ids, 'nationid', alliances
                )

                # Get all the cities
                logging.info('\t\tFetching cities')
                cities = await get_in_chunk(
                    City, get_cities, city_ids, 'cityid', nations
                )

                # Compile the statistics
                logging.info('\t\tCalculating statistics')
                stats = Stats.from_alliance(alliance)

                # Persist the data
                data.update(
                    [alliance] + list(nations.values()) +
                    list(cities.values()) + [stats]
                )
                data.session.commit()
            except:
                logging.error('\t\t\tFailed to fetch alliance')
                logging.error(traceback.format_exc())
                data.session.rollback()

            await sleep(5)  # Wait 5 seconds before starting another fetch

        # Wait for the next update iteration
        logging.info('Update complete.')
        await next_update


async def get_in_chunk(game_object, get_func, ids, id_key, parents=None):

    result = {}
    num_chunks = int(math.ceil(len(ids) / MAX_CONCURRENT_REQUESTS))
    date = datetime.utcnow()
    city_ids = []
    for i in range(0, len(ids), MAX_CONCURRENT_REQUESTS):
        logging.info('\t\t\tFetching chunk {}/{}'.format(
            int(i/MAX_CONCURRENT_REQUESTS) + 1, num_chunks
        ))
        try:
            responses = await get_func(ids[i:i + MAX_CONCURRENT_REQUESTS])
            result.update({
                int(r[id_key]):
                    game_object.from_api(r, parents=parents, date=date)
                    if parents else game_object.from_api(r, date=date)
                for r in responses if id_key in r
            })
            # Special case for Nation: remember the cities
            if game_object is Nation:
                city_ids.extend(
                    int(c) for r in responses for c in r['cityids']
                )
        except:
            logging.error('\t\t\t\tFailed to fetch chunk')
            logging.error(traceback.format_exc())

    if game_object is Nation:
        return result, city_ids
    return result


def start(local, devel):

    loop = IOLoop()
    loop.make_current()
    loop.run_sync(lambda: update_data(local, devel))
