import logging

VERSION = '1.0'


def main():
    # Set up logging
    logging.basicConfig(
        filename='ferret.log',
        level=logging.INFO,
        format='[%(asctime)s] [%(module)s:%(levelname)s] %(message)s',
        datefmt='%d/%m/%Y %H:%M:%S'
    )
    logging.getLogger().addHandler(logging.StreamHandler())
    logging.info('Ferret - v{}'.format(VERSION))

    # Import here to ensure that logging is correctly set up first
    import argparse
    import configparser
    from ferret.executor import Executor
    from ferret import server
    from ferret import updater

    # Get command-line arguments
    parser = argparse.ArgumentParser(
        description='A data collection and analysis tool for Politics & War.'
    )
    parser.add_argument(
        '--dev',
        action='store_true',
        help='Enables development mode'
    )
    parser.add_argument(
        '--local',
        type=str,
        default=None,
        help='Path to locally fetched data; by default, fetches from API.')
    args = parser.parse_args()

    # Set up debug mode
    if args.dev:
        logging.getLogger().setLevel(logging.DEBUG)
        logging.info('Enabled debug logging.')

    # Load the configuration file
    config = configparser.ConfigParser()
    config.read('config.ini')

    # Start the executor for parallel execution of the updater and other
    # potentially blocking operations.
    executor = Executor()

    # Run the downloader in parallel
    logging.info('Starting updater...')
    executor.submit(None, updater.start, args.local, args.dev)
    logging.info('Started updater.')

    # Serve forever
    logging.info('Starting server...')
    server.serve(
        executor,
        config['website']['username'],
        config['website']['password'],
        args.dev
    )


if __name__ == '__main__':
    main()
