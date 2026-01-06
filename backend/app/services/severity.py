"""Severity calculation helpers.

Rules derived from the provided SOP:
- Attack Vector (AV): Network=3, Adjacent=2, Local=1, Physical=0
- User Interaction (UI): None=2, Required=0
- EPSS percentage ranges -> scores: >=10%:4, 5-9.99%:3, 1-4.99%:2, 0.1-0.99%:1, <0.1%:0
- Sum scores -> criticality: 8-9:Critical, 6-7:High, 3-5:Medium, 0-2:Low

This module exposes compute_severity_label(epss_score, cvss_vector, fallback=None)
which returns one of 'Critical','High','Medium','Low' or the fallback if insufficient data.
"""
from __future__ import annotations

import re
from typing import Optional

# AV mapping
_AV_SCORE = {
    'N': 3,  # Network
    'A': 2,  # Adjacent
    'L': 1,  # Local
    'P': 0,  # Physical
}

# UI mapping
_UI_SCORE = {
    'N': 2,  # None -> score 2
    'R': 0,  # Required -> score 0
}

def _percentage_score_from_epss(epss_score: Optional[float]) -> int:
    if epss_score is None:
        return 0
    try:
        pct = float(epss_score) * 100.0
    except Exception:
        return 0
    if pct >= 10.0:
        return 4
    if pct >= 5.0:
        return 3
    if pct >= 1.0:
        return 2
    if pct >= 0.1:
        return 1
    return 0


def _parse_cvss_vector_for_av_ui(vector: Optional[str]) -> tuple[Optional[int], Optional[int]]:
    """Parse a CVSS v3 vector string and return (av_score, ui_score).

    Returns (None, None) if vector missing or not parseable.
    Example vector: 'AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H'
    We only parse AV: and UI: tokens.
    """
    if not vector:
        return None, None
    try:
        # normalize
        v = vector.strip()
        # sometimes vectors include prefix like 'CVSS:3.1/' - strip if present
        if v.upper().startswith('CVSS'):
            # remove leading 'CVSS:...' part
            parts = v.split('/', 1)
            if len(parts) == 2:
                v = parts[1]
            else:
                v = parts[0]

        # find AV: and UI:
        av_m = re.search(r'AV:([NALP])', v)
        ui_m = re.search(r'UI:([NR])', v)
        av_score = _AV_SCORE.get(av_m.group(1)) if av_m else None
        ui_score = _UI_SCORE.get(ui_m.group(1)) if ui_m else None
        return av_score, ui_score
    except Exception:
        return None, None


def compute_severity_label(epss_score: Optional[float], cvss_vector: Optional[str], fallback: Optional[str] = None) -> Optional[str]:
    """Compute severity label from epss_score and cvss_vector.

    Returns one of 'Critical','High','Medium','Low' or fallback if insufficient data.
    """
    av_score, ui_score = _parse_cvss_vector_for_av_ui(cvss_vector)
    pct_score = _percentage_score_from_epss(epss_score)

    # If we have no data at all, return fallback
    if av_score is None and ui_score is None and pct_score == 0:
        return fallback

    # If one of AV/UI missing, assume the less-optimistic (i.e., 0)?? We'll treat missing as 0
    av_score = av_score if av_score is not None else 0
    ui_score = ui_score if ui_score is not None else 0

    total = av_score + ui_score + pct_score

    if 8 <= total <= 9:
        return 'Critical'
    if 6 <= total <= 7:
        return 'High'
    if 3 <= total <= 5:
        return 'Medium'
    return 'Low'
