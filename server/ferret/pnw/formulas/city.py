from ferret.pnw.constants import *


def average_income(city, nation=None, minimum_wage=1.0):
    if nation is None:
        nation = city.nation
    if minimum_wage is None:
        minimum_wage = nation.minimum_wage
    return (commerce(city, nation)/50 + 1) * minimum_wage


def base_population(city):
    return city.infrastructure * 100


def commerce(city, nation=None):
    if not powered(city):
        return 0
    if nation is None:
        nation = city.nation

    improvements = dict(city.improvements)
    return min(
        sum(n * IMPROVEMENTS[i].commerce for i, n in improvements.items()),
        115 if nation and nation.projects[pr.INTERNATIONAL_TRADE_CENTER]
        else 100
    )


def crime(city, nation=None):
    if nation is None:
        nation = city.nation
    _crime = ((103 - commerce(city, nation))**2 + base_population(city))/111111
    if powered(city):
        _crime -= city.improvements[im.POLICE_STATION] * 2.5
    return min(100, max(0, _crime))


def disease(city):
    base_pop = base_population(city)
    _disease = ((base_pop / city.land) ** 2 * 0.01 - 25) / 100
    _disease += base_pop / 100000
    _disease += pollution(city) * 0.05
    if powered(city):
        _disease -= city.improvements[im.HOSPITAL] * 2.5
    return min(100, max(0, _disease))


def pollution(city):
    _powered = powered(city)
    improvements = dict(city.improvements)
    p = sum([
        IMPROVEMENTS[i].pollution * n
        if not IMPROVEMENTS[i].power or (IMPROVEMENTS[i].power and _powered)
        else 0
        for i, n in improvements.items()
    ])
    # p += city.nuclear_pollution TODO: Handle nuclear pollution
    return max(0, p)


def population(city, nation=None):
    if nation is None:
        nation = city.nation
    pop = base_population(city)
    pop -= max(0, crime(city, nation)/10*base_population(city) - 25)
    pop -= max(0, disease(city) * city.infrastructure)
    pop *= 1 + city.age / 3000
    return max(pop, 10)


def powered(city):
    infra = city.improvements[im.COAL_POWER] * 500 \
            + city.improvements[im.OIL_POWER] * 500 \
            + city.improvements[im.NUCLEAR_POWER] * 2000 \
            + city.improvements[im.WIND_POWER] * 250
    return infra >= city.infrastructure
