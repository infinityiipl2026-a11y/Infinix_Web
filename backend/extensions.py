"""
Shared Flask extension instances.

Created here (unbound) and initialized with `init_app(app)` inside app.py so
that route modules can import `limiter` without causing circular imports.
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
