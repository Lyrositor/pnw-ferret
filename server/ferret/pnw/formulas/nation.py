from math import ceil

from ferret.pnw.constants import *
from ferret.pnw.formulas import city as _city


def average_income(nation):

    p = [_city.population(city, nation) for city in nation.cities]
    return sum(
        p[i] * _city.average_income(city, nation, minimum_wage(nation))
        for i, city in enumerate(nation.cities)
    )/sum(p)


def color_bonus(nation):

    if nation.color == Color.BEIGE:
        return 5.0
    elif nation.color == Color.GRAY:
        return 0.0
    elif nation.alliance and nation.alliance.color != nation.color:
        return 0.0
    return 3.0


def cumulative_bonus(nation, treasure_bonus=None):

    if treasure_bonus is None and nation.alliance:
        treasure_bonus = nation.alliance.treasure_bonus
    return treasure_bonus + color_bonus(nation)


def full_name(nation):
    return nation.name_prefix + ' ' +  nation.name


def infrastructure(nation):
    return sum(city.infrastructure for city in nation.cities)


def land(nation):
    return sum(city.land for city in nation.cities)


def minimum_wage(nation):
    return 725/(tax_rate(nation)*10)


def population(nation):
    return sum(_city.population(city, nation) for city in nation.cities)


def res_prod(nation):
    prod = {r: 0.0 for r in RESOURCES}
    for city in nation.cities:
        for i, n in city.improvements.items():
            for resource, p in IMPROVEMENTS[i].production.items():
                if resource == res.FOOD:
                    prod[resource] += p * n * city.land
                else:
                    prod[resource] += p * n
    season = Season.SPRING  # TODO Get the current season
    if season == Season.SUMMER:
        prod[res.FOOD] *= 1.2
    elif season == Season.WINTER:
        prod[res.FOOD] *= 0.8

    # Apply any relevant project mods
    for resource, project in RES_PROD_MODS.items():
        if resource in prod and nation.projects[project]:
            prod[resource] *= PROJECT_MODS[project]

    return prod


def res_usage(nation):
    usage = {r: 0.0 for r in RESOURCES}
    for city in nation.cities:
        for i, n in city.improvements.items():
            for resource, u in IMPROVEMENTS[i].usage.items():
                usage[resource] += u * n

    # Add food consumption by population and soldiers
    usage[res.FOOD] += population(nation) / 1000
    # war = nation.wars > 0  TODO: Add support for wars
    war = False
    usage[res.FOOD] += nation.soldiers * (
        MILITARY[mil.SOLDIERS].upkeep_war
        if war else MILITARY[mil.SOLDIERS].upkeep_peace
    )[res.FOOD]

    # Apply any relevant project mods
    for resource, project in RES_USAGE_MODS.items():
        if resource in usage and nation.projects[project]:
            usage[resource] *= PROJECT_MODS[project]

    # Calculate resource usage for power production
    for city in nation.cities:
        powered = city.improvements[im.WIND_POWER] * 250
        if powered >= city.infrastructure:
            continue

        # Process the contributions of nuclear power plants
        powered, uranium_usage = _calc_power_resource_usage(
            city, powered, im.NUCLEAR_POWER, 2000, 1000, 1.2
        )
        usage[res.URANIUM] += uranium_usage
        if powered >= city.infrastructure:
            continue

        # Process the contributions of oil power plants
        powered, oil_usage = _calc_power_resource_usage(
            city, powered, im.OIL_POWER, 500, 100, 1.2
        )
        usage[res.OIL] += oil_usage
        if powered >= city.infrastructure:
            continue

        # Process the contributions of coal power plants
        powered, coal_usage = _calc_power_resource_usage(
            city, powered, im.COAL_POWER, 500, 100, 1.2
        )
        usage[res.COAL] += coal_usage

    return usage


def rev_gross(nation, treasure_bonus=None):

    return average_income(nation) \
           * population(nation) \
           * tax_rate(nation)/100 \
           * (100 + cumulative_bonus(nation, treasure_bonus)) / 100 \
           * (1.01 if nation.domestic_policy == DomesticPolicy.OPEN_MARKETS
              else 1.00)


def rev_expenses(nation, category=None):

    if category == 'power':
        return _calc_improvement_upkeep(nation, (
            im.OIL_POWER, im.COAL_POWER, im.NUCLEAR_POWER, im.WIND_POWER
        ))
    elif category == 'resources':
        return _calc_improvement_upkeep(nation, (
            im.COAL_MINE, im.OIL_WELL, im.IRON_MINE, im.BAUXITE_MINE,
            im.LEAD_MINE, im.URANIUM_MINE, im.FARM, im.GASOLINE_REFINERY,
            im.STEEL_MILL, im.ALUMINUM_REFINERY, im.MUNITIONS_FACTORY
        ))
    elif category == 'military':
        return _calc_military_upkeep(nation)
    elif category == 'city':
        return _calc_improvement_upkeep(nation, (
            im.POLICE_STATION, im.HOSPITAL, im.RECYCLING_CENTER, im.SUBWAY,
            im.SUPERMARKET, im.BANK, im.MALL, im.STADIUM
        ))
    return rev_expenses(nation, 'power') + rev_expenses(nation, 'resources') \
        + rev_expenses(nation, 'military') + rev_expenses(nation, 'city')


def tax_rate(nation):

    return TAX_RATES[nation.economic_policy]


def _calc_improvement_upkeep(nation, improvements):

    return sum(
        city.improvements[i] * IMPROVEMENTS[i].upkeep
        for city in nation.cities for i in improvements
    )


def _calc_military_upkeep(nation):

    # war = nation.wars > 0  TODO: Add support for wars
    war = False
    units = {
        mil.SOLDIERS: nation.soldiers,
        mil.TANKS: nation.tanks,
        mil.AIRCRAFT: nation.aircraft,
        mil.SHIPS: nation.ships,
        mil.SPIES: nation.spies,
        mil.MISSILES: nation.missiles,
        mil.NUKES: nation.nukes
    }
    return sum(
        n * (
            MILITARY[i].upkeep_war if war else MILITARY[i].upkeep_peace
        )[res.MONEY] for i, n in units.items()
    ) * (0.95 if nation.domestic_policy == DomesticPolicy.IMPERIALISM else 1.0)


def _calc_power_resource_usage(
        city, powered, improvement, infra_capacity, infra_per_level,
        usage_per_level
):

    imp_powered = min(
        city.improvements[improvement] * infra_capacity,
        city.infrastructure - powered
    )
    return powered + imp_powered, \
        ceil(imp_powered/infra_per_level)*usage_per_level
