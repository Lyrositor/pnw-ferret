from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.ext.declarative import declared_attr, declarative_base


class Base:

    id = Column(Integer, primary_key=True)

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()


Base = declarative_base(cls=Base)


class GameObject:

    date = Column(DateTime)

    def serialize(self):

        raise NotImplementedError(
            'Serialization not implemented for {}'.format(
                self.__class__.__name__
            )
        )

    @classmethod
    def from_api(cls, data, date=None):

        raise NotImplementedError(
            'from_api is not implemented for {}'.format(cls)
        )
