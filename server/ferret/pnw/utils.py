from json import JSONEncoder

from datetime import date, datetime, timezone
from sqlalchemy.types import UserDefinedType

from ferret.pnw.base import Base


class DictWithFixedKeys(UserDefinedType):

    def __init__(self, keys, convert=int):

        self.keys = keys
        self.convert = convert

    def get_col_spec(self, **kw):

        return "DICTWITHFIXEDKEYS({})".format(len(self.keys))

    def bind_processor(self, dialect):

        def process(value):
            if value is None:
                return None
            return ','.join(str(value[key]) for key in self.keys)

        return process

    def result_processor(self, dialect, coltype):

        def process(value):
            if value is None:
                return None
            v = value.split(',')
            return {
                key: self.convert(v[i]) for i, key in enumerate(self.keys)
            }

        return process


class PnWJSONEncoder(JSONEncoder):

    def default(self, o):

        if isinstance(o, Base):
            return o.serialize()
        elif isinstance(o, date):
            return o.isoformat()
        elif isinstance(o, datetime):
            return o.replace(tzinfo=timezone.utc).timestamp()
        super().default(o)
