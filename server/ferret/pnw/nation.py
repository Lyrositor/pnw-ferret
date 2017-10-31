from datetime import datetime, timedelta

from sqlalchemy import Boolean, Column, Date, Float, Integer, String, \
    ForeignKey, SmallInteger, DateTime
from sqlalchemy.orm import relationship

from ferret.pnw.api import API_PROJECTS, API_CONTINENTS, API_COLORS, \
    API_DOMESTIC_POLICY, API_WAR_POLICY, API_ECONOMIC_POLICY, API_SOCIAL_POLICY
from ferret.pnw.base import Base, GameObject
from ferret.pnw.constants import *
from ferret.pnw.formulas import nation
from ferret.pnw.utils import DictWithFixedKeys


class Nation(GameObject, Base):

    unique_id = Column(String)
    founded = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    vacation_mode = Column(Boolean)

    name = Column(String)
    name_prefix = Column(String)
    government = Column(String)
    social_policy = Column(String)
    leader = Column(String)
    leader_title = Column(String)
    approval_rating = Column(Float)
    flag = Column(String)

    color = Column(SmallInteger)
    continent = Column(SmallInteger)
    domestic_policy = Column(SmallInteger)
    war_policy = Column(SmallInteger)
    economic_policy = Column(SmallInteger)

    last_city_project = Column(DateTime)
    last_active = Column(DateTime)

    alliance_position = Column(SmallInteger)

    soldiers = Column(Integer)
    soldiers_casualties = Column(Integer)
    soldiers_killed = Column(Integer)
    tanks = Column(Integer)
    tanks_casualties = Column(Integer)
    tanks_killed = Column(Integer)
    aircraft = Column(Integer)
    aircraft_casualties = Column(Integer)
    aircraft_killed = Column(Integer)
    ships = Column(Integer)
    ships_casualties = Column(Integer)
    ships_killed = Column(Integer)
    spies = Column(Integer)
    missiles = Column(Integer)
    missiles_launched = Column(Integer)
    missiles_eaten = Column(Integer)
    nukes = Column(Integer)
    nukes_launched = Column(Integer)
    nukes_eaten = Column(Integer)

    infrastructure_destroyed = Column(Float)
    infrastructure_lost = Column(Float)
    money_looted = Column(Float)

    alliance_id = Column(Integer, ForeignKey('alliance.id'))
    alliance = relationship("Alliance", back_populates="members")
    cities = relationship("City", back_populates="nation")
    projects = Column(
        DictWithFixedKeys(sorted(API_PROJECTS.values()))
    )

    simple_serializable_properties = (
        'id', 'date', 'unique_id', 'founded', 'latitude', 'longitude',
        'vacation_mode', 'name', 'name_prefix', 'government',
        'economic_policy', 'social_policy', 'leader', 'leader_title',
        'approval_rating', 'flag', 'color', 'continent', 'domestic_policy',
        'war_policy', 'last_city_project', 'last_active', 'alliance_position',
        'soldiers', 'soldiers_casualties', 'soldiers_killed',
        'tanks', 'tanks_casualties', 'tanks_killed',
        'aircraft', 'aircraft_casualties', 'aircraft_killed',
        'ships', 'ships_casualties', 'ships_killed',
        'spies',
        'missiles', 'missiles_launched', 'missiles_eaten',
        'nukes', 'nukes_launched', 'nukes_eaten',
        'infrastructure_destroyed', 'infrastructure_lost', 'money_looted',
        'projects'
    )

    average_income = property(nation.average_income)
    color_bonus = property(nation.color_bonus)
    cumulative_bonus = property(nation.cumulative_bonus)
    full_name = property(nation.full_name)
    infrastructure = property(nation.infrastructure)
    land = property(nation.land)
    minimum_wage = property(nation.minimum_wage)
    population = property(nation.population)
    res_prod = property(nation.res_prod)
    res_usage = property(nation.res_usage)
    rev_gross = property(nation.rev_gross)
    rev_expenses = property(nation.rev_expenses)
    tax_rate = property(nation.tax_rate)

    def __repr__(self):

        return "<Nation(id={}, name='{}')>".format(self.id, self.name)

    def serialize(self):

        result = {}

        # Serialize the simple properties
        for p in self.simple_serializable_properties:
            result[p] = getattr(self, p)

        # Include basic details about the alliance, if this nation has one
        result['alliance'] = None
        if self.alliance is not None:
            result['alliance'] = {
                'id': self.alliance.id,
                'name': self.alliance.name,
                'flag': self.alliance.flag,
                'color': self.alliance.color,
                'treasures': self.alliance.treasures
            }

        # Provide a serialized representation of the cities
        result['cities'] = [city.serialize() for city in self.cities]

        return result

    # noinspection PyArgumentList
    @classmethod
    def from_api(cls, data, parents=None, date=None):

        if date is None:
            date = datetime.utcnow()
        projects = {p: int(data[a_p]) for a_p, p in API_PROJECTS.items()}

        return Nation(
            last_city_project=date - timedelta(
                minutes=data['cityprojecttimerturns']
            ),
            id=int(data['nationid']),
            name=data['name'],
            name_prefix=data['prename'],
            continent=API_CONTINENTS[data['continent']],
            social_policy=API_SOCIAL_POLICY[data['socialpolicy']],
            color=API_COLORS[data['color']],
            last_active=date - timedelta(minutes=data['minutessinceactive']),
            unique_id=data['uniqueid'],
            government=data['government'],
            domestic_policy=API_DOMESTIC_POLICY[data['domestic_policy']],
            war_policy=API_WAR_POLICY[data['war_policy']],
            founded=datetime.strptime(data['founded'], '%Y-%m-%d %H:%M:%S'),
            flag=data['flagurl'],
            alliance=parents[int(data['allianceid'])]
            if parents and int(data['allianceid']) in parents
            and data['allianceid'] != '0' else None,
            alliance_position=int(data['allianceposition']),
            leader=data['leadername'],
            leader_title=data['title'],
            economic_policy=API_ECONOMIC_POLICY[data['ecopolicy']],
            approval_rating=float(data['approvalrating']),
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            soldiers=int(data['soldiers']),
            soldiers_casualties=int(data['soldiercasualties']),
            soldiers_killed=int(data['soldierskilled']),
            tanks=int(data['tanks']),
            tanks_casualties=int(data['tankcasualties']),
            tanks_killed=int(data['tankskilled']),
            aircraft=int(data['aircraft']),
            aircraft_casualties=int(data['aircraftcasualties']),
            aircraft_killed=int(data['aircraftkilled']),
            ships=int(data['ships']),
            ships_casualties=int(data['shipcasualties']),
            ships_killed=int(data['shipskilled']),
            spies=60 if projects[Project.INTELLIGENCE_AGENCY] else 0,
            missiles=int(data['missiles']),
            missiles_launched=int(data['missilelaunched']),
            missiles_eaten=int(data['missileseaten']),
            nukes=int(data['nukes']),
            nukes_launched=int(data['nukeslaunched']),
            nukes_eaten=int(data['nukeseaten']),
            infrastructure_destroyed=float(data['infdesttot']),
            infrastructure_lost=float(data['infraLost']),
            money_looted=float(data['moneyLooted']),
            projects=projects,
            vacation_mode=data['vmode'] == "1",
            date=date
        )
