import requests


class WebsiteBrowser:

    BASE_URL = 'https://politicsandwar.com/'
    LOGIN_URL = BASE_URL + 'login/'
    MESSAGE_URL = BASE_URL + 'inbox/message/'

    def __init__(self):

        self.session = requests.Session()

    def login(self, username, password):

        self.session.post(self.LOGIN_URL, {
            'email': username,
            'password': password,
            'loginform': 'Login',
            'rememberme': 1
        })

    def send_new_message(self, leader, subject, body):

        self.session.post(self.MESSAGE_URL, {
            'newconversation': 'true',
            'receiver': leader,
            'carboncopy': '',
            'subject': subject,
            'body': body,
            'sndmsg': 'Send Message'
        })

