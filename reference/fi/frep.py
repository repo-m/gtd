#!/usr/bin/env python3
import argparse
import csv
import glob
import json
import logging
import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()

PATH_CATEGORIES = "/home/m/m/projects/scripts/fi/categories.json"
PATH_BUDGET = "/home/m/m/projects/scripts/fi/budget.json"

def setup_logging():
    logging.basicConfig(level=logging.INFO)

def get_args():
    parser = argparse.ArgumentParser(description='Finance Script')
    parser.add_argument('-f', nargs='+', metavar="YYYY-MM.csv", 
                        help='Provide one or more files.')
    parser.add_argument('-m', choices=['report', 'course', 'select'])
    parser.add_argument('-c', type=str)
    return parser.parse_args()

def read_json_categories() -> dict:
    with open(PATH_CATEGORIES, "r") as file:
        return json.load(file)

def load_budget_plan():
    """Reads budget and flattens it, handling both dicts and single values."""
    with open(PATH_BUDGET, "r") as file:
        raw_data = json.load(file)
    
    flat_plan = {}
    for key, value in raw_data.items():
        if isinstance(value, dict):
            flat_plan.update(value)
        else:
            flat_plan[key] = value
    return flat_plan, raw_data['targets']

def categorize(row):
    tmp_cat = read_json_categories()
    for key, values in tmp_cat.items():
        for value in values:
            if value in row['Buchungstext']:
                return key
    return None

def select_csv_files(user_selection: list) -> list:
    all_csv_files = sorted(glob.glob('*.csv'))
    disk_set = set(all_csv_files)
    if user_selection == ['all']:
        return all_csv_files
    user_set = set(user_selection)
    if user_set.issubset(disk_set):
        if len(user_selection) == 1:
            return user_selection
        user_selection.sort()
        start, end = user_selection[0], user_selection[-1]
        return [f for f in all_csv_files if start <= f <= end]
    logging.info(f"Missing files: {user_set - disk_set}")
    return []

def parse_csv_data(csv_files: list, mode, selected_category):
    sald = 0.00
    budget, targets = load_budget_plan()
    
    psald, psafe = targets['psald'], targets['psafe']

    p = {
        '__in': budget['vwag'] + budget['hani'] + budget['subs'] + budget['ires'],
        'Ifix': budget['vwag'] + budget['hani'] + budget['subs'],
        'vwag': budget['vwag'], 'hani': budget['hani'], 'subs': budget['subs'], 
        'Ires': budget['ires'],
        '__sp': budget['home'] + budget['comm'] + budget['abon'] + budget['kids'] + 
                budget['donn'] + budget['nour'] + budget['medi'] + budget['mobi'] + 
                budget['fash'] + budget['life'] + budget['bist'] + budget['azpp'] + 
                budget['sres'] + budget['savings'],
        'Sfix': budget['home'] + budget['comm'] + budget['abon'] + budget['kids'] + budget['donn'],
        'home': budget['home'], 'comm': budget['comm'], 'abon': budget['abon'], 'kids': budget['kids'],
        'donn': budget['donn'], 
        'Svar': budget['nour'] + budget['medi'] + budget['mobi'] + budget['fash'] + 
                budget['life'] + budget['bist'] + budget['azpp'],
        'nour': budget['nour'], 'medi': budget['medi'], 'mobi': budget['mobi'], 
        'fash': budget['fash'], 'life': budget['life'], 'bist': budget['bist'], 
        'azpp': budget['azpp'], 'Sres': budget['sres'], 'savings': budget['savings']
    }

    i = {'__in': 0.0, 'Ifix': 0.0, 'vwag': 0.0, 'hani': 0.0, 'subs': 0.0, 'Ires': 0.0}
    s = {'__sp': 0.0, 'Sfix': 0.0, 'home': 0.0, 'comm': 0.0, 'abon': 0.0, 'kids': 0.0, 'donn': 0.0, 
         'Svar': 0.0, 'nour': 0.0, 'medi': 0.0, 'mobi': 0.0, 'fash': 0.0, 'life': 0.0, 'bist': 0.0, 
         'azpp': 0.0, 'Sres': 0.0, 'savings': 0.0}

    for csv_file in csv_files:
        with open(csv_file, newline='', encoding='iso-8859-1') as csvfile:
            reader = csv.reader((line for line in csvfile if line.strip()), delimiter=';')
            headers = next(reader)
            c = csv.DictReader(csvfile, delimiter=';', fieldnames=headers)
            for row in c:
                try:
                    amount = float(row['Umsatz in EUR'].replace('.', '').replace(',', '.'))
                    sald += amount
                    cat = categorize(row)
                    if amount > 0:
                        i['__in'] += amount
                        t_cat = cat if cat in i else 'Ires'
                        i[t_cat] += amount
                        if mode == 'select' and selected_category == t_cat:
                            console.print(f"[green]+{amount:8.2f}[/green] | {row['Buchungstag']} | {row['Buchungstext'][:50]}")
                    else:
                        s['__sp'] += amount
                        t_cat = cat if cat in s else 'Sres'
                        s[t_cat] += amount
                        if mode == 'select' and selected_category == t_cat:
                            console.print(f"[red]{amount:9.2f}[/red] | {row['Buchungstag']} | {row['Buchungstext'][:50]}")
                except (ValueError, TypeError, KeyError): continue

    i['Ifix'] = i['vwag'] + i['hani'] + i['subs']
    s['Sfix'] = s['home'] + s['comm'] + s['abon'] + s['kids'] + s['donn']
    s['Svar'] = s['nour'] + s['mobi'] + s['fash'] + s['life'] + s['bist'] + s['azpp'] + s['medi']
    
    return [sald, round(abs(s['savings']), 2), i, s, p, psald, psafe]

def check_data(data):
    sald, safe, i, s, p, psald, psafe = data
    if round(i['__in'] + s['__sp'], 2) != round(sald, 2): return False
    if round(s['__sp'], 2) != round(s['Sfix'] + s['Svar'] + s['savings'] + s['Sres'], 2): return False
    return True

def print_result(csv_file, mode, selected_category, data):
    sald, safe, i, s, p, psald, psafe = data

    if mode == 'report':
        console.print(Panel(f"[bold cyan]Finance Report:[/bold cyan] {csv_file}", expand=False))
        for section, d_ref, style in [('INCOME', i, "bold green"), ('SPENDINGS', s, "bold red")]:
            table = Table(title=section, title_style=style, show_header=True, box=None)
            table.add_column("Category")
            table.add_column("Actual", justify="right")
            table.add_column("Planned", justify="right")
            table.add_column("Delta", justify="right")
            for k, val in d_ref.items():
                if k[1] == '_': label = f"[bold white]{k}[/bold white]"
                elif k[0] in ['I', 'S'] or k == 'savings': label = f"  [cyan]➔ {k}[/cyan]"
                else: label = f"    [dim]• {k}[/dim]"
                diff = round(val - p[k], 2)
                color = "green" if (diff >= 0 if section == 'INCOME' else diff <= 0) else "red"
                table.add_row(label, f"{val:.2f}€", f"{p[k]:.2f}€", f"[{color}]{diff:+.2f}€[/{color}]")
            console.print(table)
        console.print(Panel(f"Saldo: {sald:.2f}€ (Target: {psald}€)\nSafe:  {safe:.2f}€", title="TOTALS"))

    elif mode in ['select', 'course']:
        val = i.get(selected_category, s.get(selected_category, 0))
        planned = p.get(selected_category, 0)
        diff = round(val - planned, 2)
        color = "green" if (diff >= 0 if selected_category in i else diff <= 0) else "red"
        console.print(f"[bold]{csv_file}[/bold] | {selected_category}: [bold]{val:.2f}€[/bold] (Plan: {planned:.2f}€ | Delta: [{color}]{diff:+.2f}€[/{color}])")

def main():
    args = get_args()
    setup_logging()
    csv_files = select_csv_files(args.f if args.f else ['all'])
    
    if args.m == "course":
        total_val = 0
        for f_item in csv_files:
            data = parse_csv_data([f_item], args.m, args.c)
            print_result(f_item, args.m, args.c, data)
            total_val += data[2].get(args.c, data[3].get(args.c, 0))
        if csv_files:
            console.print(f"\n[bold yellow]Average for {args.c}: {total_val / len(csv_files):.2f}€[/bold yellow]")
    elif args.f:
        data = parse_csv_data(csv_files, args.m, args.c)
        if args.m == 'select' or check_data(data):
            print_result(args.f, args.m, args.c, data)

if __name__ == "__main__":
    main()