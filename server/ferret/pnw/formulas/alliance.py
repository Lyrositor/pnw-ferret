from math import sqrt

from ferret.pnw.constants import RESOURCES
from ferret.pnw.formulas import nation


def rev_gross(alliance):
    return sum(nation.rev_gross(member) for member in alliance.members)


def rev_expenses(alliance):
    return sum(nation.rev_expenses(member) for member in alliance.members)


def res_prod(alliance):
    prod = {r: 0.0 for r in RESOURCES}
    for member in alliance.members:
        for r, p in nation.res_prod(member).items():
            prod[r] += p
    return prod


def res_usage(alliance):
    prod = {r: 0.0 for r in RESOURCES}
    for member in alliance.members:
        for r, p in nation.res_usage(member).items():
            prod[r] += p
    return prod


def treasure_bonus(alliance):

    if alliance:
        return round(sqrt(alliance.treasures * 4), 2)
    return 0.0
