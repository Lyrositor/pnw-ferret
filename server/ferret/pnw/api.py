import html
import json
import logging

from tornado.gen import multi

# Use the cURL HTTP client when possible
try:
    from tornado.curl_httpclient import CurlAsyncHTTPClient as AsyncHTTPClient
    logging.info('Using cURL HTTP client')
except ImportError:
    from tornado.simple_httpclient import SimpleAsyncHTTPClient as \
        AsyncHTTPClient
    logging.info('Using Simple HTTTP client')

from ferret.pnw.constants import Color, Continent, DomesticPolicy, \
    EconomicPolicy, WarPolicy, im, pr, SocialPolicy

API_URL = 'http://politicsandwar.com/api/'
MAX_CONCURRENT_REQUESTS = 100

API_COLORS = {
    'aqua': Color.AQUA, 'beige': Color.BEIGE, 'black': Color.BLACK,
    'blue': Color.BLUE, 'brown': Color.BROWN, 'gray': Color.GRAY,
    'green': Color.GREEN, 'lime': Color.LIME, 'maroon': Color.MAROON,
    'olive': Color.OLIVE, 'orange': Color.ORANGE, 'pink': Color.PINK,
    'purple': Color.PURPLE, 'red': Color.RED, 'white': Color.WHITE,
    'yellow': Color.YELLOW
}

API_CONTINENTS = {
    'North America': Continent.NORTH_AMERICA,
    'South America': Continent.SOUTH_AMERICA, 'Europe': Continent.EUROPE,
    'Africa': Continent.AFRICA, 'Asia': Continent.ASIA,
    'Australia': Continent.AUSTRALIA
}

API_DOMESTIC_POLICY = {
    'Manifest Destiny': DomesticPolicy.MANIFEST_DESTINY,
    'Open Markets': DomesticPolicy.OPEN_MARKETS,
    'Technological Advancement': DomesticPolicy.TECHNOLOGICAL_ADVANCEMENT,
    'Imperialism': DomesticPolicy.IMPERIALISM,
    'Urbanization': DomesticPolicy.URBANIZATION,
}

API_ECONOMIC_POLICY = {
    'extremely left wing': EconomicPolicy.EXTREMELY_LEFT_WING,
    'far left wing': EconomicPolicy.FAR_LEFT_WING,
    'left wing': EconomicPolicy.LEFT_WING,
    'moderate': EconomicPolicy.MODERATE,
    'right wing': EconomicPolicy.RIGHT_WING,
    'far right wing': EconomicPolicy.FAR_RIGHT_WING,
    'extremely right wing': EconomicPolicy.EXTREMELY_RIGHT_WING,
}

API_IMPROVEMENTS = {
    'coalpower': im.COAL_POWER, 'oilpower': im.OIL_POWER,
    'nuclearpower': im.NUCLEAR_POWER, 'windpower': im.WIND_POWER,

    'coalmine': im.COAL_MINE, 'oilwell': im.OIL_WELL, 'ironmine': im.IRON_MINE,
    'bauxitemine': im.BAUXITE_MINE, 'leadmine': im.LEAD_MINE,
    'uramine': im.URANIUM_MINE, 'farm': im.FARM,

    'gasrefinery': im.GASOLINE_REFINERY, 'steelmill': im.STEEL_MILL,
    'aluminumrefinery': im.ALUMINUM_REFINERY,
    'munitionsfactory': im.MUNITIONS_FACTORY,

    'policestation': im.POLICE_STATION, 'hospital': im.HOSPITAL,
    'recyclingcenter': im.RECYCLING_CENTER, 'subway': im.SUBWAY,

    'supermarket': im.SUPERMARKET, 'bank': im.BANK, 'mall': im.MALL,
    'stadium': im.STADIUM,

    'barracks': im.BARRACKS, 'factory': im.FACTORY, 'hangar': im.HANGAR,
    'drydock': im.DRYDOCK,
}

API_PROJECTS = {
    'ironworks': pr.IRON_WORKS, 'bauxiteworks': pr.BAUXITE_WORKS,
    'armsstockpile': pr.ARMS_STOCK_PILE,
    'emgasreserve': pr.EMERGENCY_GAS_RESERVE,
    'massirrigation': pr.MASS_IRRIGATION,
    'inttradecenter': pr.INTERNATIONAL_TRADE_CENTER,
    'missilelpad': pr.MISSILE_LAUNCH_PAD,
    'nuclearresfac': pr.NUCLEAR_RESEARCH_FACILITY,
    'irondome': pr.IRON_DOME, 'vitaldefsys': pr.VITAL_DEFENSE_SYSTEM,
    'intagncy': pr.INTELLIGENCE_AGENCY,
    'uraniumenrich': pr.URANIUM_ENRICHMENT_PROGRAM,
    'propbureau': pr.PROPAGANDA_BUREAU,
    'cenciveng': pr.CENTER_CIVIL_ENGINEERING
}

API_SOCIAL_POLICY = {
    'anarchist': SocialPolicy.ANARCHIST,
    'libertarian': SocialPolicy.LIBERTARIAN,
    'liberal': SocialPolicy.LIBERAL,
    'moderate': SocialPolicy.MODERATE,
    'conservative': SocialPolicy.CONSERVATIVE,
    'authoritarian': SocialPolicy.AUTHORITARIAN,
    'fascist': SocialPolicy.FASCIST
}

API_WAR_POLICY = {
    'Attrition': WarPolicy.ATTRITION, 'Turtle': WarPolicy.TURTLE,
    'Blitzkrieg': WarPolicy.BLITZKRIEG, 'Fortress': WarPolicy.FORTRESS,
    'Moneybags': WarPolicy.MONEYBAGS, 'Pirate': WarPolicy.PIRATE,
    'Tactician': WarPolicy.TACTICIAN, 'Guardian': WarPolicy.GUARDIAN,
    'Covert': WarPolicy.COVERT, 'Arcane': WarPolicy.ARCANE,
}


async def get_all_alliances():

    return (await send_requests('alliances/'))[0]['alliances']


async def get_alliances(alliance_ids):

    return await send_requests(
        ['alliance/id={}'.format(i) for i in alliance_ids]
    )


async def get_alliance(alliance_id):

    return (await get_alliances([alliance_id]))[0]


async def get_all_nations():

    return (await send_requests('nations/'))[0]['nations']


async def get_nations(nation_ids):

    return await send_requests(['nation/id={}'.format(i) for i in nation_ids])


async def get_nation(nation_id):

    return (await get_nations([nation_id]))[0]


async def get_cities(city_ids):

    return await send_requests(['city/id={}'.format(i) for i in city_ids])


async def get_city(city_id):

    return (await get_cities([city_id]))[0]


async def send_requests(paths):

    if isinstance(paths, str):
        paths = [paths]
    http_client = AsyncHTTPClient(max_clients=MAX_CONCURRENT_REQUESTS)
    responses = await multi([http_client.fetch(
        API_URL + path,
        connect_timeout=7200,
        request_timeout=7200
    ) for path in paths])
    return [
        json.loads(html.unescape(r.body.decode('utf-8'))) for r in responses
    ]
