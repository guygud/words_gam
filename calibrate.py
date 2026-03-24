#!/usr/bin/env python3
"""
calibrate.py — Monte Carlo calibration for calculator2.html (Курогочи ММБ v2).
No external dependencies (pure stdlib).

Variant 2: e1_mult < 2.0 makes СО structurally better than С-1 per item.
Both A and B use min-cost/item (strategy=1) → both prefer СО.
A (savings + dividends) has more coins → affords СО more consistently.
B (no savings) falls back to С-1 more often → structurally slower.

P50 zone-completion targets (calendar days, daysPerWeek=4):
  Zone:            Z1   Z2   Z3   Z4   Z5
  B (no savings):   3    6   10   15   20
  A (savings 40%):  3    4    7   10   14

Run:  python3 calibrate.py
"""

import math
import random
import time
from collections import defaultdict

# ── Game constants (must match calculator2.html) ──────────────────────────────
ROOMS_PER_ZONE = 3
ITEMS_PER_ROOM = 5
ITEMS_NEEDED   = ROOMS_PER_ZONE * ITEMS_PER_ROOM   # 15 unique items per zone
NUM_ZONES      = 5
ACT_DAYS       = 90
OTK_COST       = 4       # energy per OTK game
OTK_SUCCESS    = 0.75
# e1_mult is a search parameter; e0=1.0, e2=4.0 are fixed
EGG_ITEMS      = [0.5, 1.0, 2.0]   # expected items (С-1 is probabilistic 50%)
STREAK_RATES   = [0.10, 0.15, 0.20, 0.25, 0.35]

# Anchor rates for p1/p2
ANCHOR_AL_PER_WEEK = 3.5
ANCHOR_AM_PER_WEEK = 1.4
ANCHOR_AL_COINS    = 20
ANCHOR_AM_COINS    = 50
ANCHOR_AL_CAP      = 0.5
ANCHOR_AM_CAP      = 1.0

# Calibration targets (calendar days, cumulative from start)
TARGETS_B = [3,  6, 10, 15, 20]
TARGETS_A = [3,  4,  7, 10, 14]


# ── Poisson sampler (stdlib only) ─────────────────────────────────────────────
def poisson(lam):
    if lam <= 0:
        return 0
    L = math.exp(-lam)
    k, p = 0, 1.0
    while True:
        k += 1
        p *= random.random()
        if p <= L:
            return k - 1


# ── Binomial sampler (n Bernoulli trials) ─────────────────────────────────────
def binomial(n, p):
    return sum(1 for _ in range(n) if random.random() < p)


# ── Egg buying strategies (mirrors selectEggTier in JS) ──────────────────────
def select_egg(spendable, base_cost, strategy, save_threshold=0.8, mults=None):
    if mults is None:
        mults = [1.0, 2.0, 4.0]
    if strategy == 1:
        # Min cost-per-item; tiebreak: cheapest first
        best, best_cpe, best_cost = -1, math.inf, math.inf
        for ei in range(3):
            cost = base_cost * mults[ei]
            if spendable < cost:
                continue
            cpe = cost / EGG_ITEMS[ei]
            if cpe < best_cpe - 1e-9 or (abs(cpe - best_cpe) < 1e-9 and cost < best_cost):
                best, best_cpe, best_cost = ei, cpe, cost
        return best
    if strategy == 2:
        target_cost = base_cost * mults[1]
        if spendable >= target_cost:
            for ei in range(2, -1, -1):
                if spendable >= base_cost * mults[ei]:
                    return ei
        if spendable < target_cost * save_threshold and spendable >= base_cost * mults[0]:
            return 0
        return -1
    # Strategy 0: greedy
    for ei in range(2, -1, -1):
        if spendable >= base_cost * mults[ei]:
            return ei
    return -1


# ── Core simulation ───────────────────────────────────────────────────────────
def simulate(params, use_savings, strategy=1, n_runs=300):
    """Returns list of 5 P50 zone-completion days (calendar days, Inf if not done).

    Overnight model (matches calculator2.html):
      Evening: earn coins, buy eggs, manually deposit only a share of remainder.
      Interest accrues once per calendar day, including skipped days.
      Morning buying exists only for 2+ sessions/day, and there is no auto re-deposit.
    """
    zone_costs  = params['zone_costs']
    ga_rewards  = params['ga_rewards']
    gb_rewards  = params['gb_rewards']
    base_cap    = params['base_cap']
    max_cap     = params['max_cap']
    dup_rate    = params['dup_rate']
    save_thr    = params.get('save_threshold', 0.8)
    e1_mult     = params.get('e1_mult', 2.0)
    egg_mults   = [1.0, e1_mult, 4.0]
    e2_mult     = 4.0
    sessions    = params.get('sessions_per_day', 2)
    dep_frac    = params.get('deposit_frac', 0.8) if use_savings else 0.0

    play_chance = 4 / 7.0
    lam_al = ANCHOR_AL_PER_WEEK / 7.0
    lam_am = ANCHOR_AM_PER_WEEK / 7.0

    all_zone_days = []

    for _ in range(n_runs):
        daily_cap     = base_cap
        coins         = 0.0
        savings_dep   = 0.0
        div_this_zone = 0.0
        cur_zone      = 0
        unique_items  = 0
        streak        = 0
        last_play_day = -2
        zone_days     = []

        def buy_eggs(cur_day):
            nonlocal coins, cur_zone, unique_items, div_this_zone
            while cur_zone < NUM_ZONES:
                base_cost = zone_costs[cur_zone]
                ei = select_egg(coins, base_cost, strategy, save_thr, egg_mults)
                if ei < 0:
                    break
                coins -= base_cost * egg_mults[ei]
                new_items = (1 if random.random() < 0.5 else 0) if ei == 0 else int(EGG_ITEMS[ei])
                for _i in range(new_items):
                    if unique_items < ITEMS_NEEDED and random.random() >= dup_rate:
                        unique_items += 1
                if unique_items >= ITEMS_NEEDED:
                    zone_days.append(cur_day)
                    cur_zone += 1
                    unique_items = 0
                    div_this_zone = 0.0
                    if cur_zone >= NUM_ZONES:
                        break

        for day in range(ACT_DAYS):
            if cur_zone >= NUM_ZONES:
                break
            is_play_day = random.random() < play_chance

            if use_savings and savings_dep > 0 and streak > 0:
                zi = min(cur_zone, NUM_ZONES - 1)
                rate     = STREAK_RATES[streak - 1]
                max_divs = 5 * zone_costs[zi] * e2_mult
                div_earn = min(savings_dep * rate, max(0.0, max_divs - div_this_zone))
                if div_earn > 0:
                    savings_dep += div_earn
                    div_this_zone += div_earn

            if not is_play_day:
                if last_play_day >= 0 and day > last_play_day:
                    streak = max(1, streak - 1)
                continue

            if use_savings and savings_dep > 0:
                coins += savings_dep
                savings_dep = 0.0

            if sessions >= 2 and coins > 0:
                buy_eggs(day)

            utilization  = 1.0 if sessions >= 2 else 0.6
            energy       = daily_cap * utilization
            otk_games    = int(energy / OTK_COST)
            energy_word  = energy - otk_games * OTK_COST
            otk_reward   = ga_rewards[min(cur_zone, NUM_ZONES - 1)]
            word_cpe     = gb_rewards[min(cur_zone, NUM_ZONES - 1)]
            wins         = binomial(otk_games, OTK_SUCCESS)
            coins_earned = wins * otk_reward + energy_word * word_cpe
            n_al = poisson(lam_al)
            n_am = poisson(lam_am)
            if n_al > 0:
                coins_earned += n_al * ANCHOR_AL_COINS
                daily_cap = min(max_cap, daily_cap + n_al * ANCHOR_AL_CAP)
            if n_am > 0:
                coins_earned += n_am * ANCHOR_AM_COINS
                daily_cap = min(max_cap, daily_cap + n_am * ANCHOR_AM_CAP)
            coins += coins_earned

            buy_eggs(day)

            if use_savings and dep_frac > 0 and coins > 0:
                dep_in = coins * dep_frac
                savings_dep += dep_in
                coins -= dep_in

            if last_play_day < 0:
                streak = 1
            elif day == last_play_day + 1:
                streak = min(streak + 1, 5)
            else:
                streak = max(1, streak)
            last_play_day = day

        while len(zone_days) < NUM_ZONES:
            zone_days.append(math.inf)
        all_zone_days.append(zone_days)

    # P50 per zone
    medians = []
    for z in range(NUM_ZONES):
        vals   = sorted(r[z] for r in all_zone_days)
        finite = [v for v in vals if v < math.inf]
        if len(finite) >= n_runs * 0.5:
            medians.append(finite[int(0.5 * len(finite))])
        else:
            medians.append(math.inf)
    return medians


# ── Loss function ─────────────────────────────────────────────────────────────
def loss(med_a, med_b):
    L = 0.0
    for i in range(NUM_ZONES):
        for med, tgt in [(med_b[i], TARGETS_B[i]), (med_a[i], TARGETS_A[i])]:
            L += 100.0 if med == math.inf else ((med - tgt) / tgt) ** 2
        if med_a[i] != math.inf and med_b[i] != math.inf and med_a[i] >= med_b[i]:
            L += 5.0
    return L


# ── Parameter sampling ────────────────────────────────────────────────────────
BASE_CAPS      = [20, 22, 24, 26, 28, 30, 32]
Z0_VALS        = [5, 6, 7, 8]
ZONE_GROWTHS   = [1.25, 1.28, 1.32, 1.36, 1.40]
GA_REWARD_Z0   = [14, 16, 18, 20, 22]
GA_REWARD_GROW = [1.06, 1.08, 1.10, 1.12]
DUP_RATES      = [0.05, 0.08, 0.10, 0.12]
E1_MULTS       = [1.50, 1.55, 1.60, 1.65, 1.70, 1.75, 1.80]
DEP_FRACS      = [0.60, 0.70, 0.80, 0.90, 1.00]
GB_RATIO       = 0.12   # word-cpe ≈ fraction of gA reward


def sample_params():
    while True:
        base_cap = random.choice(BASE_CAPS)
        z0       = random.choice(Z0_VALS)
        zg       = random.choice(ZONE_GROWTHS)
        ga_z0    = random.choice(GA_REWARD_Z0)
        ga_grow  = random.choice(GA_REWARD_GROW)
        dup_rate = random.choice(DUP_RATES)
        e1_mult  = random.choice(E1_MULTS)
        dep_frac = random.choice(DEP_FRACS)
        if ga_z0 > 3.0 * z0:
            continue
        zone_costs = [round(z0 * (zg ** i), 1) for i in range(NUM_ZONES)]
        ga_rewards = [round(ga_z0 * (ga_grow ** i), 2) for i in range(NUM_ZONES)]
        gb_rewards = [round(r * GB_RATIO, 3) for r in ga_rewards]
        return {
            'base_cap':         base_cap,
            'max_cap':          base_cap * 2,
            'zone_costs':       zone_costs,
            'ga_rewards':       ga_rewards,
            'gb_rewards':       gb_rewards,
            'dup_rate':         dup_rate,
            'save_threshold':   0.8,
            'e1_mult':          e1_mult,
            'deposit_frac':     dep_frac,
            'sessions_per_day': 2,  # both A and B are Вовлечённый (2 sessions)
            '_z0': z0, '_zg': zg, '_ga_z0': ga_z0, '_ga_grow': ga_grow,
        }


# ── Main ──────────────────────────────────────────────────────────────────────
def fmt(meds):
    return '  '.join(f'{m:5.1f}' if m < math.inf else '  inf' for m in meds)


def main():
    N_RUNS   = 400
    TIME_LIM = 150  # seconds

    print(f"Searching params (budget={TIME_LIM}s, {N_RUNS} runs/candidate)…\n")
    print(f"Targets  B: {fmt(TARGETS_B)}")
    print(f"Targets  A: {fmt(TARGETS_A)}")
    print()

    results = []
    t0 = time.time()
    tried = 0

    while time.time() - t0 < TIME_LIM:
        params = sample_params()
        # B: no savings (greedy spender, coins carry forward)
        # A: savings=True, overnight model, both use min-cost strategy
        med_b  = simulate(params, use_savings=False, strategy=1, n_runs=N_RUNS)
        med_a  = simulate(params, use_savings=True,  strategy=1, n_runs=N_RUNS)
        L      = loss(med_a, med_b)
        results.append((L, params, med_a, med_b))
        tried += 1
        if tried % 5 == 0:
            best_L = min(r[0] for r in results)
            print(f"  [{time.time()-t0:5.0f}s] tried={tried}  best_loss={best_L:.4f}")

    results.sort(key=lambda x: x[0])
    print(f"\nDone — {tried} candidates in {time.time()-t0:.1f}s\n")

    print(f"{'#':>3}  {'loss':>6}  "
          f"{'cap':>3}  {'z0':>4}  {'zG':>4}  {'gaZ0':>4}  {'gaG':>5}  "
          f"{'dup':>4}  {'e1m':>4}  {'dep':>4}  "
          f"{'zone costs':>26}  "
          f"{'medB':>30}  {'medA':>30}")
    print('-' * 142)

    for rank, (L, p, ma, mb) in enumerate(results[:5], 1):
        zc = ' '.join(f'{c:.0f}' for c in p['zone_costs'])
        print(
            f"{rank:>3}  {L:>6.4f}  "
            f"{p['base_cap']:>3}  {p['_z0']:>4}  {p['_zg']:>4}  "
            f"{p['_ga_z0']:>4}  {p['_ga_grow']:>5}  "
            f"{p['dup_rate']:>4.2f}  "
            f"{p['e1_mult']:>4.2f}  "
            f"{p['deposit_frac']:>4.2f}  "
            f"[{zc}]  "
            f"B:[{fmt(mb)}]  "
            f"A:[{fmt(ma)}]"
        )

    print()
    best_p, best_a, best_b = results[0][1], results[0][2], results[0][3]
    print("=" * 60)
    print("BEST PARAMETER SET")
    print("=" * 60)
    print(f"  baseCap         = {best_p['base_cap']}")
    print(f"  maxCap          = {best_p['max_cap']}")
    print(f"  dupRate         = {best_p['dup_rate']}")
    print(f"  e1_mult         = {best_p['e1_mult']}  (e0=1.0, e2=4.0 fixed)")
    print(f"  deposit_frac    = {best_p['deposit_frac']}")
    print(f"  zone_costs      = {best_p['zone_costs']}")
    print(f"  ga_rewards      = {best_p['ga_rewards']}")
    print(f"  gb_rewards      = {best_p['gb_rewards']}")
    print()
    print(f"  Achieved B (p50): {fmt(best_b)}")
    print(f"  Target  B       : {fmt(TARGETS_B)}")
    print(f"  Achieved A (p50): {fmt(best_a)}")
    print(f"  Target  A       : {fmt(TARGETS_A)}")
    print("=" * 60)


def validate(params_list, n_runs=1000):
    """High-accuracy validation of a list of parameter dicts."""
    print(f"\n{'='*60}")
    print(f"VALIDATION ({n_runs} runs each, both strategy=1 min-cost)")
    print(f"{'='*60}")
    for label, params in params_list:
        med_b = simulate(params, use_savings=False, strategy=1, n_runs=n_runs)
        med_a = simulate(params, use_savings=True,  strategy=1, n_runs=n_runs)
        L = loss(med_a, med_b)
        print(f"\n{label}  loss={L:.4f}")
        print(f"  B (p50): {fmt(med_b)}  targets: {fmt(TARGETS_B)}")
        print(f"  A (p50): {fmt(med_a)}  targets: {fmt(TARGETS_A)}")
        print(f"  params:  baseCap={params['base_cap']}  maxCap={params['max_cap']}  "
              f"dup={params['dup_rate']}  e1_mult={params.get('e1_mult',2.0)}  "
              f"dep={params.get('deposit_frac',0.0)}")
        print(f"  zones:   {params['zone_costs']}")
        print(f"  gaRew:   {params['ga_rewards']}")


if __name__ == '__main__':
    main()

    # ── Validate top candidate from search above (filled in manually after run) ─
    # Update this dict after inspecting the search results above.
    candidates = []
    if candidates:
        validate(candidates, n_runs=1000)
