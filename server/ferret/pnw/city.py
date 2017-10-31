from datetime import datetime

from sqlalchemy import Column, Date, ForeignKey, Integer, String, SmallInteger
from sqlalchemy.orm import relationship

from ferret.pnw.api import API_IMPROVEMENTS
from ferret.pnw.constants import *
from ferret.pnw.base import Base, GameObject
from ferret.pnw.formulas import city
from ferret.pnw.utils import DictWithFixedKeys


class City(GameObject, Base):

    name = Column(String)
    founded = Column(Date)
    infrastructure = Column(SmallInteger)
    land = Column(SmallInteger)
    nation_id = Column(Integer, ForeignKey('nation.id'))
    nation = relationship('Nation', back_populates='cities')
    improvements = Column(DictWithFixedKeys(sorted(IMPROVEMENTS.keys())))

    def __repr__(self):

        return "<City(id={}, name='{}')>".format(self.id, self.name)

    def get_age(self):

        return (self.date.date() - self.founded).days

    age = property(get_age)
    average_income = property(city.average_income)
    base_population = property(city.base_population)
    commerce = property(city.commerce)
    crime = property(city.crime)
    disease = property(city.disease)
    pollution = property(city.pollution)
    population = property(city.population)
    powered = property(city.powered)

    def serialize(self):

        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'founded': self.founded,
            'infrastructure': self.infrastructure,
            'land': self.land,
            'improvements': self.improvements
        }

    # noinspection PyArgumentList
    @classmethod
    def from_api(cls, data, parents=None, date=None):

        if date is None:
            date = datetime.utcnow()
        return City(
            id=int(data['cityid']),
            name=data['name'],
            nation=parents[int(data['nationid'])] if parents else None,
            founded=datetime.strptime(data['founded'], '%Y-%m-%d').date(),
            infrastructure=float(data['infrastructure']),
            land=float(data['land']),
            improvements={
                API_IMPROVEMENTS[i[4:]]: int(data[i])
                for i in data if i.startswith('imp_')
            },
            date=date
        )
