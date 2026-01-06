#!/usr/bin/env python3
"""Backfill/recompute EPSS scores for existing Vulnerability rows.

This script will find Vulnerability rows missing an EPSS score and either
perform the lookup synchronously or enqueue background jobs using RQ if
REDIS_URL is configured.

Usage:
    recompute_epss.py [--apply] [--batch N] [--sleep S]

Options:
    --apply    : actually write updates / enqueue jobs. Without --apply the
                 script runs in dry-run mode and only reports what it would do.
    --batch N  : limit to N rows (default 100)
    --sleep S  : per-lookup sleep (seconds) when running synchronously (default 0.2)
"""
import os
import sys
import time
from argparse import ArgumentParser

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from app.models.vulnerability import Vulnerability
from app.services.vulnerability_service import enrich_vulnerability_with_epss, enrich_vulnerabilities_batch

def main():
    p = ArgumentParser()
    p.add_argument('--apply', action='store_true', help='Apply changes/enqueue jobs')
    p.add_argument('--batch', type=int, default=100)
    p.add_argument('--sleep', type=float, default=0.2)
    args = p.parse_args()

    with app.app_context():
    # synchronous-only backfill
        query = Vulnerability.query.filter((Vulnerability.epss_score == None) | (Vulnerability.epss_score == ''))
        candidates = query.limit(args.batch).all()
        print(f"Found {len(candidates)} candidate(s) for EPSS enrichment (batch={args.batch})")

        to_update = []
        for v in candidates:
            print(f"- {v.id} {v.cve_id} (epss={v.epss_score})")
            to_update.append(v)

        if not args.apply:
            print('\nDry-run mode. Use --apply to enqueue or update records.')
            return

        # apply mode: run concurrency-limited async enrichment (sync-wrapper)
        ids = [v.id for v in to_update]
        results = enrich_vulnerabilities_batch(ids, concurrency=5, sleep_between=args.sleep)
        for r in results:
            print(r)

if __name__ == '__main__':
    main()
