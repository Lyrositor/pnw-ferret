import hashlib

from sqlalchemy import Integer, Column, String, SmallInteger

from ferret.pnw.base import Base

LEADER_PASSWORD_SALT = b'ferretpnwsheepy2017'


class LeaderPrivilege:

    OWN_NATION = 0b01
    OWN_ALLIANCE_NATIONS = 0b10
    ALL_NATIONS = 0b100
    OWN_ALLIANCE = 0b1000
    ALL_ALLIANCES = 0b10000


class Leader(Base):

    nation_id = Column(Integer)
    password = Column(String)
    privilege = Column(
        SmallInteger,
        default=LeaderPrivilege.OWN_NATION |
                LeaderPrivilege.OWN_ALLIANCE_NATIONS |
                LeaderPrivilege.ALL_ALLIANCES
    )
    # discord = Column(String)

    def change_password(self, password):

        self.password = self.make_password(password)

    def check_password(self, password):

        return self.make_password(password) == self.password

    @staticmethod
    def make_password(password):

        return hashlib.pbkdf2_hmac(
            'sha256', password.encode('UTF-8'), LEADER_PASSWORD_SALT, 100000
        )
