from datetime import datetime

from sqlalchemy import Boolean, Column, SmallInteger, String
from sqlalchemy.orm import relationship

from ferret.pnw.api import API_COLORS
from ferret.pnw.base import Base, GameObject
from ferret.pnw.formulas import alliance, general


class Alliance(GameObject, Base):

    name = Column(String)
    acronym = Column(String)
    flag = Column(String)
    forum = Column(String)
    irc = Column(String)
    color = Column(SmallInteger)
    accepting = Column(Boolean)
    treasures = Column(SmallInteger)
    members = relationship('Nation', back_populates='alliance')
    stats = relationship('Stats', uselist=False, back_populates='alliance')

    resource_production = property(alliance.res_prod)
    resource_usage = property(alliance.res_usage)
    revenue_gross = property(alliance.rev_gross)
    revenue_expenses = property(alliance.rev_expenses)
    treasure_bonus = property(alliance.treasure_bonus)

    def serialize(self):

        return {
            'name': self.name,
            'acronym': self.acronym,
            'flag': self.flag,
            'forum': self.forum,
            'irc': self.irc,
            'color': self.color,
            'accepting': self.accepting,
            'treasures': self.treasures,
            'members': [{'id': m.id, 'name': m.name} for m in self.members],
            'stats': self.stats.serialize() if self.stats else None
        }

    def __repr__(self):

        return "<Alliance(id={}, name='{}')>".format(self.id, self.name)

    # noinspection PyArgumentList
    @classmethod
    def from_api(cls, data, date=None):

        if date is None:
            date = datetime.utcnow()
        return Alliance(
            id=int(data['allianceid']),
            name=data['name'],
            acronym=data['acronym'],
            color=API_COLORS[data['color']],
            accepting=bool(data['accepting members']),
            flag=data['flagurl'],
            forum=data['forumurl'],
            irc=data['irc'],
            treasures=data['treasures'],
            date=date
        )
