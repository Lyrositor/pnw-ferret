from setuptools import setup

setup(
    name='ferret',
    version='1.0',
    description='A data collection and analysis tool for Politics & War.',
    author='Lyrositor',
    packages=['ferret'],
    python_requires='>=3.5',
    install_requires=['tornado', 'transcrypt', 'sqlalchemy', 'requests',
                      'torndsession'],
    entry_points={
        'console_scripts': [
            'ferret=ferret.main:main',
        ],
    }
)
