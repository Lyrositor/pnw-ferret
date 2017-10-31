class AlliancePosition:

    NONE = 0
    APPLICANT = 1
    MEMBER = 2
    OFFICER = 3
    HEIR = 4
    LEADER = 5


class Color:

    AQUA = 0
    BEIGE = 1
    BLACK = 2
    BLUE = 3
    BROWN = 4
    GRAY = 5
    GREEN = 6
    LIME = 7
    MAROON = 8
    OLIVE = 9
    ORANGE = 10
    PINK = 11
    PURPLE = 12
    RED = 13
    WHITE = 14
    YELLOW = 15


class Continent:

    NORTH_AMERICA = 0
    SOUTH_AMERICA = 1
    EUROPE = 2
    AFRICA = 3
    ASIA = 4
    AUSTRALIA = 5


class DomesticPolicy:

    MANIFEST_DESTINY = 0
    OPEN_MARKETS = 1
    TECHNOLOGICAL_ADVANCEMENT = 2
    IMPERIALISM = 3
    URBANIZATION = 4


class EconomicPolicy:

    EXTREMELY_LEFT_WING = 0
    FAR_LEFT_WING = 1
    LEFT_WING = 2
    MODERATE = 3
    RIGHT_WING = 4
    FAR_RIGHT_WING = 5
    EXTREMELY_RIGHT_WING = 6


class Improvement:

    COAL_POWER = 0
    OIL_POWER = 1
    NUCLEAR_POWER = 2
    WIND_POWER = 3

    COAL_MINE = 4
    OIL_WELL = 5
    IRON_MINE = 6
    BAUXITE_MINE = 7
    LEAD_MINE = 8
    URANIUM_MINE = 9
    FARM = 10

    GASOLINE_REFINERY = 11
    STEEL_MILL = 12
    ALUMINUM_REFINERY = 13
    MUNITIONS_FACTORY = 14

    POLICE_STATION = 15
    HOSPITAL = 16
    RECYCLING_CENTER = 17
    SUBWAY = 18

    SUPERMARKET = 19
    BANK = 20
    MALL = 21
    STADIUM = 22

    BARRACKS = 23
    FACTORY = 24
    HANGAR = 25
    DRYDOCK = 26


class ImprovementStats:

    def __init__(
            self, name, purchase, upkeep=0.0, production=None, usage=None,
            pollution=0, commerce=0.0, capacity=None, _max=None, power=False
    ):

        self.name = name
        self.purchase = purchase
        self.upkeep = upkeep
        self.production = production if production is not None else {}
        self.usage = usage if usage is not None else {}
        self.pollution = pollution
        self.commerce = commerce
        self.capacity = capacity if capacity is not None else {}
        self.max = _max
        self.power = power


class Military:

    SOLDIERS = 1
    TANKS = 2
    AIRCRAFT = 3
    SHIPS = 4
    SPIES = 5
    MISSILES = 6
    NUKES = 7


class MilitaryStats:

    def __init__(self, purchase, upkeep_peace, upkeep_war=None, battle=None):

        self.purchase = purchase
        self.upkeep_peace = upkeep_peace
        self.upkeep_war = upkeep_war if upkeep_war is not None \
            else upkeep_peace
        self.battle = battle


class Project:

    IRON_WORKS = 0
    BAUXITE_WORKS = 1
    ARMS_STOCK_PILE = 2
    EMERGENCY_GAS_RESERVE = 3
    MASS_IRRIGATION = 4
    INTERNATIONAL_TRADE_CENTER = 5
    MISSILE_LAUNCH_PAD = 6
    NUCLEAR_RESEARCH_FACILITY = 7
    IRON_DOME = 8
    VITAL_DEFENSE_SYSTEM = 9
    INTELLIGENCE_AGENCY = 10
    URANIUM_ENRICHMENT_PROGRAM = 11
    PROPAGANDA_BUREAU = 12
    CENTER_CIVIL_ENGINEERING = 13


class Resource:

    MONEY = 0

    # Raw
    FOOD = 1
    COAL = 2
    OIL = 3
    URANIUM = 4
    IRON = 5
    BAUXITE = 6
    LEAD = 7

    # Manufactured
    GASOLINE = 8
    STEEL = 9
    ALUMINUM = 10
    MUNITIONS = 11


class Season:

    SUMMER = 0
    FALL = 1
    WINTER = 2
    SPRING = 4


class SocialPolicy:

    ANARCHIST = 0
    LIBERTARIAN = 1
    LIBERAL = 2
    MODERATE = 3
    CONSERVATIVE = 4
    AUTHORITARIAN = 5
    FASCIST = 6


class WarPolicy:

    ATTRITION = 0
    TURTLE = 1
    BLITZKRIEG = 2
    FORTRESS = 3
    MONEYBAGS = 4
    PIRATE = 5
    TACTICIAN = 6
    GUARDIAN = 7
    COVERT = 8
    ARCANE = 9


im = Improvement
mil = Military
pr = Project
res = Resource


CONTINENT_RESOURCES = {
    Continent.NORTH_AMERICA: (im.COAL_MINE, im.IRON_MINE, im.URANIUM_MINE),
    Continent.SOUTH_AMERICA: (im.OIL_POWER, im.BAUXITE_MINE, im.LEAD_MINE),
    Continent.EUROPE: (im.COAL_MINE, im.IRON_MINE, im.LEAD_MINE),
    Continent.AFRICA: (im.OIL_POWER, im.BAUXITE_MINE, im.URANIUM_MINE),
    Continent.ASIA: (im.OIL_POWER, im.IRON_MINE, im.URANIUM_MINE),
    Continent.AUSTRALIA: (im.COAL_MINE, im.BAUXITE_MINE, im.LEAD_MINE)
}

CONTINENTS = (
    Continent.NORTH_AMERICA, Continent.SOUTH_AMERICA, Continent.EUROPE,
    Continent.AFRICA, Continent.ASIA, Continent.AUSTRALIA
)

ECONOMIC_POLICIES = (
    EconomicPolicy.EXTREMELY_LEFT_WING, EconomicPolicy.FAR_LEFT_WING,
    EconomicPolicy.LEFT_WING, EconomicPolicy.MODERATE,
    EconomicPolicy.RIGHT_WING, EconomicPolicy.FAR_RIGHT_WING,
    EconomicPolicy.EXTREMELY_RIGHT_WING
)

MILITARY = {
    mil.SOLDIERS: MilitaryStats(
        purchase={res.MONEY: 2.00},
        upkeep_peace={res.MONEY: 1.25, res.FOOD: 1/750},
        upkeep_war={res.MONEY: 1.88, res.FOOD: 1/500},
        battle={res.MUNITIONS: 1/5000}
    ),
    mil.TANKS: MilitaryStats(
        purchase={res.MONEY: 60.0, res.STEEL: 1.0},
        upkeep_peace={res.MONEY: 50.0},
        upkeep_war={res.MONEY: 70.0},
        battle={res.MUNITIONS: 1/100, res.GASOLINE: 1/100}
    ),
    mil.AIRCRAFT: MilitaryStats(
        purchase={res.MONEY: 4000.0, res.ALUMINUM: 3.0},
        upkeep_peace={res.MONEY: 500.0},
        upkeep_war={res.MONEY: 750.0},
        battle={res.MUNITIONS: 1/4, res.GASOLINE: 1/4}
    ),
    mil.SHIPS: MilitaryStats(
        purchase={res.MONEY: 50000.0, res.STEEL: 25.0},
        upkeep_peace={res.MONEY: 3750.0},
        upkeep_war={res.MONEY: 5625.0},
        battle={res.MUNITIONS: 3, res.GASOLINE: 2}
    ),
    mil.SPIES: MilitaryStats(
        purchase={res.MONEY: 50000.0},
        upkeep_peace={res.MONEY: 2400.0},
    ),
    mil.MISSILES: MilitaryStats(
        purchase={
            res.MONEY: 150000.0, res.ALUMINUM: 100.0, res.MUNITIONS: 75.0,
            res.GASOLINE: 75.0
        },
        upkeep_peace={res.MONEY: 21000.0},
        upkeep_war={res.MONEY: 31500.0}
    ),
    mil.NUKES: MilitaryStats(
        purchase={
            res.MONEY: 1750000.0, res.ALUMINUM: 750.0, res.MUNITIONS: 500.0,
            res.URANIUM: 250.0
        },
        upkeep_peace={res.MONEY: 35000.0},
        upkeep_war={res.MONEY: 52500.0}
    )
}

IMPROVEMENTS = {
    # Power
    im.COAL_POWER: ImprovementStats(
        name='Coal Power Plant',
        purchase={res.MONEY: 5000.0},
        upkeep=1200.0,
        pollution=8,
        power=False
    ),
    im.OIL_POWER: ImprovementStats(
        name='Oil Power Plant',
        purchase={res.MONEY: 5000.0},
        upkeep=1800.0,
        pollution=6,
        power=False
    ),
    im.NUCLEAR_POWER: ImprovementStats(
        name='Nuclear Power Plant',
        purchase={res.MONEY: 500000.0, res.STEEL: 100.0},
        upkeep=10500.0,
        power=False
    ),
    im.WIND_POWER: ImprovementStats(
        name='Wind Power Plant',
        purchase={res.MONEY: 30000.0, res.ALUMINUM: 25.0},
        upkeep=500.0,
        power=False
    ),

    # Resources
    im.COAL_MINE: ImprovementStats(
        name='Coal Mine',
        purchase={res.MONEY: 1000.0},
        upkeep=400.0,
        production={res.COAL: 3.0},
        pollution=12,
        _max=12,
        power=False
    ),
    im.OIL_WELL: ImprovementStats(
        name='Oil Well',
        purchase={res.MONEY: 1500.0},
        upkeep=600.0,
        production={res.OIL: 3.0},
        pollution=12,
        _max=12,
        power=False
    ),
    im.IRON_MINE: ImprovementStats(
        name='Iron Mine',
        purchase={res.MONEY: 9500.0},
        upkeep=1600.0,
        production={res.IRON: 3.0},
        pollution=12,
        _max=6,
        power=False
    ),
    im.BAUXITE_MINE: ImprovementStats(
        name='Bauxite Mine',
        purchase={res.MONEY: 9500.0},
        upkeep=1600.0,
        production={res.BAUXITE: 3.0},
        pollution=12,
        _max=6,
        power=False
    ),
    im.LEAD_MINE: ImprovementStats(
        name='Lead Mine',
        purchase={res.MONEY: 7500.0},
        upkeep=1500.0,
        production={res.LEAD: 3.0},
        pollution=12,
        _max=10,
        power=False
    ),
    im.URANIUM_MINE: ImprovementStats(
        name='Uranium Mine',
        purchase={res.MONEY: 25000.0},
        upkeep=5000.0,
        production={res.URANIUM: 3.0},
        pollution=20,
        _max=3,
        power=False
    ),
    im.FARM: ImprovementStats(
        name='Farm',
        purchase={res.MONEY: 1000.0},
        upkeep=300.0,
        production={res.FOOD: 12.0/500.0},
        pollution=2,
        _max=20,
        power=False
    ),

    # Manufacturing
    im.GASOLINE_REFINERY: ImprovementStats(
        name='Oil Refinery',
        purchase={res.MONEY: 45000.0},
        upkeep=4000.0,
        production={res.GASOLINE: 6.0},
        usage={res.OIL: 3.0},
        pollution=32,
        _max=5,
        power=True
    ),
    im.STEEL_MILL: ImprovementStats(
        name='Steel Mill',
        purchase={res.MONEY: 45000.0},
        upkeep=4000.0,
        production={res.STEEL: 9.0},
        usage={res.IRON: 3.0, res.COAL: 3.0},
        pollution=40,
        _max=5,
        power=True
    ),
    im.ALUMINUM_REFINERY: ImprovementStats(
        name='Aluminum Refinery',
        purchase={res.MONEY: 30000.0},
        upkeep=2500.0,
        production={res.ALUMINUM: 9.0},
        usage={res.BAUXITE: 3.0},
        pollution=40,
        _max=5,
        power=True
    ),
    im.MUNITIONS_FACTORY: ImprovementStats(
        name='Munitions Factory',
        purchase={res.MONEY: 35000.0},
        upkeep=3500.0,
        production={res.MUNITIONS: 18.0},
        usage={res.LEAD: 6.0},
        pollution=32,
        _max=5,
        power=True
    ),

    # Civil
    im.POLICE_STATION: ImprovementStats(
        name='Police Station',
        purchase={res.MONEY: 75000.0, res.STEEL: 20.0},
        upkeep=750.0,
        pollution=1,
        _max=5,
        power=True
    ),
    im.HOSPITAL: ImprovementStats(
        name='Hospital',
        purchase={res.MONEY: 100000.0, res.ALUMINUM: 25.0},
        upkeep=1000.0,
        pollution=4,
        _max=5,
        power=True
    ),
    im.RECYCLING_CENTER: ImprovementStats(
        name='Recycling Center',
        purchase={res.MONEY: 125000.0},
        upkeep=2500.0,
        pollution=-70,
        _max=3,
        power=True
    ),
    im.SUBWAY: ImprovementStats(
        name='Subway',
        purchase={res.MONEY: 250000.0, res.ALUMINUM: 25, res.STEEL: 50},
        upkeep=3250.0,
        pollution=-45,
        commerce=8,
        _max=1,
        power=True
    ),

    # Commerce
    im.SUPERMARKET: ImprovementStats(
        name='Supermarket',
        purchase={res.MONEY: 5000.0},
        upkeep=600.0,
        commerce=3,
        _max=6,
        power=True
    ),
    im.BANK: ImprovementStats(
        name='Bank',
        purchase={res.MONEY: 15000.0, res.ALUMINUM: 10, res.STEEL: 5},
        upkeep=1800.0,
        commerce=5,
        _max=5,
        power=True
    ),
    im.MALL: ImprovementStats(
        name='Shopping Mall',
        purchase={res.MONEY: 45000.0, res.ALUMINUM: 25, res.STEEL: 20},
        upkeep=5400.0,
        pollution=2,
        commerce=9,
        _max=4,
        power=True
    ),
    im.STADIUM: ImprovementStats(
        name='Stadium',
        purchase={res.MONEY: 100000.0, res.ALUMINUM: 50, res.STEEL: 40},
        upkeep=12150.0,
        pollution=5,
        commerce=12,
        _max=3,
        power=True
    ),

    # Military
    im.BARRACKS: ImprovementStats(
        name='Barracks',
        purchase={res.MONEY: 3000.0},
        _max=5,
        capacity={mil.SOLDIERS: 3000},
        power=True
    ),
    im.FACTORY: ImprovementStats(
        name='Factory',
        purchase={res.MONEY: 0.0},
        _max=5,
        capacity={mil.TANKS: 250},
        power=True
    ),
    im.HANGAR: ImprovementStats(
        name='Hangar',
        purchase={res.MONEY: 0.0},
        _max=5,
        capacity={mil.AIRCRAFT: 18},
        power=True
    ),
    im.DRYDOCK: ImprovementStats(
        name='Drydock',
        purchase={res.MONEY: 0.0},
        _max=3,
        capacity={mil.SHIPS: 5},
        power=True
    )
}

PROJECT_MODS = {
    Project.ARMS_STOCK_PILE: 1.34,
    Project.BAUXITE_WORKS: 1.36,
    Project.EMERGENCY_GAS_RESERVE: 2.00,
    Project.IRON_WORKS: 1.36,
    Project.MASS_IRRIGATION: 500/400,
    Project.URANIUM_ENRICHMENT_PROGRAM: 2.00
}

RES_PROD_MODS = {
    res.MUNITIONS: Project.ARMS_STOCK_PILE,
    res.ALUMINUM: Project.BAUXITE_WORKS,
    res.GASOLINE: Project.EMERGENCY_GAS_RESERVE,
    res.STEEL: Project.IRON_WORKS,
    res.FOOD: Project.MASS_IRRIGATION,
    res.URANIUM: Project.URANIUM_ENRICHMENT_PROGRAM
}

RES_USAGE_MODS = {
    res.LEAD: Project.ARMS_STOCK_PILE,
    res.BAUXITE: Project.BAUXITE_WORKS,
    res.OIL: Project.EMERGENCY_GAS_RESERVE,
    res.COAL: Project.IRON_WORKS,
    res.IRON: Project.IRON_WORKS,
}

RESOURCES = (
    res.FOOD, res.COAL, res.OIL, res.URANIUM, res.IRON, res.BAUXITE, res.LEAD,
    res.GASOLINE, res.STEEL, res.ALUMINUM, res.MUNITIONS
)

SOCIAL_POLICIES = (
    SocialPolicy.ANARCHIST, SocialPolicy.LIBERTARIAN, SocialPolicy.LIBERAL,
    SocialPolicy.MODERATE, SocialPolicy.CONSERVATIVE,
    SocialPolicy.AUTHORITARIAN, SocialPolicy.FASCIST
)

TAX_RATES = {
    EconomicPolicy.EXTREMELY_LEFT_WING: 46.63,
    EconomicPolicy.FAR_LEFT_WING: 44.38,
    EconomicPolicy.LEFT_WING: 36.50,
    EconomicPolicy.MODERATE: 30.88,
    EconomicPolicy.RIGHT_WING: 16.25,
    EconomicPolicy.FAR_RIGHT_WING: 12.88,
    EconomicPolicy.EXTREMELY_RIGHT_WING: 5.00
}
