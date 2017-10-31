import sqlalchemy
import sqlalchemy.orm

from ferret.pnw.alliance import Alliance
from ferret.pnw.base import Base
from ferret.pnw.city import City
from ferret.pnw.leader import Leader
from ferret.pnw.nation import Nation

DATABASE_FILE = 'sqlite:///ferret.db'


class Data:

    def __init__(self):

        self.engine = sqlalchemy.create_engine(DATABASE_FILE)
        Base.metadata.create_all(self.engine)
        Session = sqlalchemy.orm.sessionmaker(bind=self.engine)
        self.session = Session()

    def __del__(self):

        self.session.close()

    def update(self, entities):

        for entity in entities:
            self.session.merge(entity)

    def get_alliance(self, alliance_id):

        return self._get_one_of(Alliance, alliance_id)

    def get_alliances(self, alliance_ids=None):

        return self._get_set_of(Alliance, alliance_ids)

    def get_alliance_list(self):

        return self._get_summary(Alliance)

    def get_nation(self, nation_id):

        return self._get_one_of(Nation, nation_id)

    def get_nations(self, nation_ids=None):

        return self._get_set_of(Nation, nation_ids)

    def get_nation_list(self):

        return self._get_summary(Nation)

    def get_city(self, city_id):

        return self._get_one_of(City, city_id)

    def get_cities(self, city_ids=None):

        return self._get_set_of(City, city_ids)

    def add_leader(self, nation_id, password):

        return self.session.add(
            Leader(
                nation_id=nation_id,
                password=Leader.make_password(password)
            )
        )

    def get_leader(self, nation_id):

        return self.session.query(Leader) \
            .filter(Leader.nation_id == nation_id) \
            .one_or_none()

    def _get_one_of(self, query_class, _id):

        query = self.session.query(query_class).filter(query_class.id == _id)
        return query.one_or_none()

    def _get_set_of(self, query_class, ids):

        query = self.session.query(query_class)
        if ids is not None:
            query = query.filter(query_class.id.in_(ids))
        return self._to_dict_by_id(query.all())

    def _get_summary(self, query_class):

        query = self.session \
            .query(query_class.id, query_class.name, query_class.flag)
        return [{'id': r[0], 'name': r[1], 'flag': r[2]} for r in query.all()]

    @staticmethod
    def _to_dict_by_id(results):

        return {r.id: r for r in results}
