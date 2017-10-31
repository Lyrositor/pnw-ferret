from concurrent.futures import ThreadPoolExecutor
from functools import partial

from tornado.ioloop import IOLoop


class Executor:

    def __init__(self):

        self.executor = ThreadPoolExecutor()

    def submit(self, callback, func, *args, **kwargs):

        job = self.executor.submit(
            partial(func, *args, **kwargs)
        )
        if callback:
            job.add_done_callback(
                lambda future: IOLoop.instance().add_callback(
                    partial(callback, future)
                )
            )
        return job
