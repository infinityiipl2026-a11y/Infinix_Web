"""
Entry point for Vercel's Python (WSGI) runtime.

The uploaded version of this file was a separate, unrelated stub Flask app
("Hello") with none of the real blueprints registered — meanwhile
vercel.json pointed at *this* file as the deployment target. That means a
Vercel deployment would have served only "Hello" on every route; none of
the real API (/login, /products, /cart, /orders, ...) was ever reachable.

This file now simply re-exports the real, fully configured app from
backend/app.py so Vercel's builder finds a working `app` WSGI callable here.

IMPORTANT CAVEATS if you actually deploy to Vercel specifically:
  1. Local disk writes (the `uploads/` folder used by /add-product) do NOT
     persist on Vercel's serverless filesystem between invocations — you
     need object storage (e.g. S3, Cloudinary, R2) for uploaded images.
  2. A fresh MySQL connection/pool per cold start plus MySQL's connection
     limits do not mix well with serverless auto-scaling. Use a
     serverless-friendly database (PlanetScale, Aurora Serverless, etc.) or
     a pooling proxy (e.g. PlanetScale's connector, RDS Proxy), or deploy
     this Flask app on a normal long-running host instead (Render, Railway,
     Fly.io, a Docker container, a VM) where a persistent process and local
     disk both work as written.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app  # noqa: E402  (import after sys.path fix, re-exported below)

__all__ = ["app"]
