from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship

from ferret.pnw.base import GameObject, Base
from ferret.pnw.constants import RESOURCES, ECONOMIC_POLICIES, \
    SOCIAL_POLICIES, CONTINENTS
from ferret.pnw.utils import DictWithFixedKeys


class Stats(GameObject, Base):

    econ = Column(DictWithFixedKeys(ECONOMIC_POLICIES, int))
    social = Column(DictWithFixedKeys(SOCIAL_POLICIES, int))
    revenue_gross = Column(Float)
    revenue_expenses = Column(Float)
    resource_production = Column(DictWithFixedKeys(RESOURCES, float))
    resource_usage = Column(DictWithFixedKeys(RESOURCES, float))
    continent = Column(DictWithFixedKeys(CONTINENTS, int))

    alliance_id = Column(Integer, ForeignKey('alliance.id'))
    alliance = relationship('Alliance', back_populates='stats')

    def __repr__(self):

        return "<Stats(date={}, alliance={})>".format(self.date, self.alliance)

    def serialize(self):

        return {
            'econ': self.econ,
            'social': self.social,
            'rev_gross': self.revenue_gross,
            'rev_expenses': self.revenue_expenses,
            'res_prod': self.resource_production,
            'res_usage': self.resource_usage,
            'continent': self.continent
        }

    @classmethod
    def from_alliance(cls, alliance, date=None):

        return cls.from_nations(alliance.members, date, alliance)

    # noinspection PyArgumentList
    @classmethod
    def from_nations(cls, nations, date=None, alliance=None):

        if date is None:
            date = datetime.utcnow()

        econ = {e: 0 for e in ECONOMIC_POLICIES}
        social = {s: 0 for s in SOCIAL_POLICIES}
        revenue_gross = 0.0
        revenue_expenses = 0.0
        resource_production = {r: 0.0 for r in RESOURCES}
        resource_usage = {r: 0.0 for r in RESOURCES}
        continent = {c: 0 for c in CONTINENTS}
        for nation in nations:
            econ[nation.economic_policy] += 1
            social[nation.social_policy] += 1
            revenue_gross += nation.rev_gross
            revenue_expenses += nation.rev_expenses
            nation_prod = nation.res_prod
            nation_usage = nation.res_usage
            for r, p in nation_prod.items():
                resource_production[r] += p
            for r, u in nation_usage.items():
                resource_usage[r] += u
            continent[nation.continent] += 1
        return Stats(
            date=date,
            alliance=alliance,
            econ=econ,
            social=social,
            revenue_gross=revenue_gross,
            revenue_expenses=revenue_expenses,
            resource_production=resource_production,
            resource_usage=resource_usage,
            continent=continent
        )
