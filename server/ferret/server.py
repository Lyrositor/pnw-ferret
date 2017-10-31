import configparser
import json
import logging
import random
import string
import subprocess
import torndsession.sessionhandler
from os.path import abspath, dirname, join

import tornado.escape
import tornado.ioloop
import tornado.web

from ferret.data import Data
from ferret.pnw.leader import LeaderPrivilege as LP, Leader
from ferret.pnw.utils import PnWJSONEncoder
from ferret.pnw.website import WebsiteBrowser

SERVER_PORT = 8084

REGISTER_SUBJECT = 'Ferret registration for {}'
REGISTER_BODY = 'Hello {},\n\n' \
                + 'This is an automated message from Ferret. ' \
                + 'Your account has been successfully created.\n\n' \
                + 'Your password is: {}\n\n' \
                + 'Please do not hesitate to contact me with any questions ' \
                + 'you might have.\n\n' \
                + 'Kind regards,\n' \
                + 'Lyrositor'


class FerretApplication(tornado.web.Application):

    def __init__(self, browser, data, executor, dev):

        super().__init__(
            [(r'/(.*)', ApiHandler, {
                'browser': browser, 'data': data, 'executor': executor
            })],
            compiled_template_cache=not dev,
            static_hash_cache=not dev,
            serve_traceback=dev,
            session={
                'driver': 'file',
                'driver_settings': {'host': 'sessions'},
                'force_persistence': True,
                'sid_name': 'ferretSessionID',
                'session_lifetime': 7200
            }
        )


class ApiHandler(torndsession.sessionhandler.SessionBaseHandler):

    def __init__(self, application, request, **kwargs):

        self.handlers = {
            'initialize': self.handle_initialize,
            'login': self.handle_login,
            'logout': self.handle_logout,
            'register': self.handle_register,
            'alliance': self.handle_alliance,
            'alliances': self.handle_alliances,
            'nation': self.handle_nation,
            'nations': self.handle_nations,
            'password': self.handle_password
        }

        # Read the URL of the client from the config file
        config = configparser.ConfigParser()
        config.read('config.ini')
        self.client_url = config['server']['client']

        self.browser = None
        self.data = None
        self.executor = None
        super().__init__(application, request, **kwargs)

    def initialize(self, browser=None, data=None, executor=None):

        self.browser = browser
        self.data = data
        self.executor = executor

    def set_default_headers(self):

        self.set_header('Access-Control-Allow-Origin', self.client_url)
        self.set_header('Access-Control-Allow-Credentials', 'true')

    def post(self, path):

        # Handle this request
        try:
            handler = self.handlers[path]
        except KeyError:
            self.set_status(404)
            self.write({'error': 'Invalid API path'})
            return
        result = handler()

        # Write out the result as JSON
        self.write(
            json.dumps(result, cls=PnWJSONEncoder, separators=(',', ':'))
        )
        self.set_header('Content-Type', 'application/json')

    def handle_initialize(self):

        return {
            'nationId': self.get_current_user(),
            'tradePrices': {}  # TODO Send current trade prices
        }

    def handle_register(self):

        # Validate input and load relevant information
        if self.get_current_user():
            return {'error': 'Leader is already logged in'}
        try:
            nation_id = int(self.get_argument('nationId'))
        except ValueError:
            return {'error': 'Invalid nation ID'}
        leader = self.data.get_leader(nation_id)
        if leader:
            return {'error': 'Leader is already registered'}
        nation = self.data.get_nation(nation_id)
        if not nation:
            return {'error': 'Nation details not found'}

        # Create a new account and send a message to the leader in-game
        password = ''.join(
            random.choice(
                string.ascii_letters + string.digits
            ) for _ in range(random.randint(10, 16))
        )
        self.data.add_leader(nation_id, password)
        self.data.session.commit()
        self.browser.send_new_message(
            nation.leader,
            REGISTER_SUBJECT.format(nation.leader),
            REGISTER_BODY.format(nation.leader, password)
        )

        return {'leader': nation.leader}

    def handle_login(self):

        # Validate input and load relevant information
        if self.get_current_user():
            return {'error': 'Leader is already logged in'}
        try:
            nation_id = int(self.get_argument('nationId'))
        except ValueError:
            return {'error': 'Invalid nation ID'}
        leader = self.data.get_leader(nation_id)
        if not leader:
            return {'error': 'Leader not found for nation ID'}
        password = self.get_argument('password')
        nation = self.data.get_nation(nation_id)
        if not nation:
            return {'error': 'Nation details not found'}
        if not leader.check_password(password):
            return {'error': 'Invalid password'}

        self.set_current_user(nation_id)
        return {'nationId': nation_id}

    def handle_logout(self):

        if not self.get_current_user():
            return {'error': 'Leader is not logged in'}
        self.set_current_user(None)
        return {'nationId': None}

    def handle_alliance(self):

        alliance_id = int(self.get_argument('id'))
        if not self.check_leader_privilege(True, alliance_id=alliance_id):
            return {'error': 'Insufficient privileges'}
        alliance = self.data.get_alliance(alliance_id)
        return {'alliance': alliance}

    def handle_alliances(self):

        if not self.check_leader_privilege(True):
            return {'error': 'Insufficient privileges'}
        alliances = self.data.get_alliance_list()
        return {'alliances': alliances}

    def handle_nation(self):

        nation_id = int(self.get_argument('id'))
        if not self.check_leader_privilege(True, nation_id=nation_id):
            return {'error': 'Insufficient privileges'}
        nation = self.data.get_nation(nation_id)
        return {'nation': nation}

    def handle_nations(self):

        if not self.check_leader_privilege(True):
            return {'error': 'Insufficient privileges'}
        nations = self.data.get_nation_list()
        return {'nations': nations}

    def handle_password(self):

        leader = self.check_leader_privilege(True)
        if not leader or not isinstance(leader, Leader):
            return {'error': 'Insufficient privileges'}
        password = self.get_argument('password')
        if not password:
            return {'error': 'New password cannot be empty'}
        leader.change_password(password)
        self.data.session.add(leader)
        self.data.session.commit()
        return {}

    def check_leader_privilege(self, logged_in, **params):

        if logged_in:
            nation_id = self.get_current_user()
            if nation_id:
                leader = self.data.get_leader(nation_id)
                p = leader.privilege
                nation = self.data.get_nation(nation_id)
                if 'nation_id' in params:
                    if p & LP.ALL_NATIONS:
                        return True
                    elif p & LP.OWN_NATION and \
                            params['nation_id'] == nation.id:
                        return True
                    elif p & LP.OWN_ALLIANCE_NATIONS:
                        target_nation = self.data.get_nation(
                            params['nation_id']
                        )
                        if not target_nation.alliance:
                            return True
                        elif not nation.alliance:
                            return False
                        else:
                            return target_nation.alliance.id == \
                                   nation.alliance.id
                    else:
                        return False
                elif 'alliance_id' in params:
                    return \
                        (p & LP.OWN_ALLIANCE and nation.alliance and
                         params['alliance_id'] == nation.alliance.id) \
                        or p & LP.ALL_ALLIANCES
                else:
                    return leader
            else:
                return False
        return True

    def get_current_user(self):

        if 'current_user' in self.session:
            return self.session['current_user']
        return None

    def set_current_user(self, nation_id):

        if not nation_id:
            del self.session['current_user']
        else:
            self.session['current_user'] = nation_id


def build_pnw_js():

    # Specify the various source and target directories
    current_dir = dirname(abspath(__file__))
    source_dir = join(current_dir, 'pnw', 'export')
    source = join(source_dir, 'pnw.py')
    output_dir = join(source_dir, '__javascript__')
    output_file = join(output_dir, 'pnw.js')
    target_file = join(
        dirname(dirname(current_dir)), 'web', 'src', 'utils', 'pnw.js'
    )

    # Run transcrypt to convert the Python constants and formulas to JavaScript
    # HACK: Export the function from the JS file to expose it as an ES module.
    subprocess.run(
        'transcrypt -k -b -p .none -n -e 6 ' + source,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True, shell=True
    )
    with open(output_file) as f:
        js = f.read().replace('pnw ();', 'export default pnw ();')
    with open(target_file, 'w') as f:
        f.write(js)


def serve(executor, website_username, website_password, dev=False):

    # Set up the connection to the database and to the website
    browser = WebsiteBrowser()
    browser.login(website_username, website_password)
    data = Data()

    # Transpile the constants and formulas to JavaScript for in-browser editing
    # Note: this is pretty hacky, and is just used to avoid having duplicating
    # code between JS and Python.
    if dev:
        build_pnw_js()

    # Start the web application
    app = FerretApplication(browser, data, executor, dev)
    app.listen(SERVER_PORT)
    logging.info('Serving on: http://127.0.0.1:{}'.format(SERVER_PORT))
    tornado.ioloop.IOLoop.current().start()
