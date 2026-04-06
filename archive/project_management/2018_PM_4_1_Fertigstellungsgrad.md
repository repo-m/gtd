# 4.1 Fertigstellungsgradermittlung (FSG)

> Definition von Fertigstellungsgrad (FSG): Verhältnis der zu einem Stichtag erbrachten Leistungen zur Gesamtleistung eines Arbeitspaketes oder eines Projektes.

Verfahren | Beschreibung
--- | ---
Statusschritte (Projekt) | <ru><li>Dieses Verfahren misst die Fertigstellung auf der Ebene des Projektes</li><li>benötigt ein etabliertes Phasenmodell (d.h. Lebenszyklus), das sowohl im aktuellen wie in Referenzprojekten Anwendung findet</li><li>Aus Erfahrungswerten vergleichbarer Projekte wird der FSG des laufenden Projektes abgeleitet. Sehr schnelles, aber ungenaues Verfahren</li></ru>
Proportionale Verfahren | Die proportionale Verfahren messen Fertigstellung auf Arbeitspaketebene anhand von Bezugsgrößen wie Menge oder Zeit<ru><li>Mengenproportional: Fertigstellungsgradermittlung erfolgt anhand der proportionalen zur Gesamtmenge des APs fertig gestellten Einheiten</li><li>Zeitproportional: FSG-Ermittlung erfolgt anhand der proportionalen zur veranschlagten Gesamtdauer des APs und verstrichenen Zeit. Funktioniert nur bei dauerproportionalen APs</li></ru>
Feste Bewertung | Diese Verfahren gewähren zu Beginn des APs pauschal 50 bzw. 20 oder 0% Fortschritt, und dann bei Beendigung die restlichen 50 bzw. 80 bzw. 100%.<ru><li>50-50: Bei Vorgängen mit umfangreichen Vorarbeiten und sicherer Beendigung</li><li>20-80: Wenn Vorleistungen genutzt werden kann</li><li>0-100: Bei Vorgängen von sehr kurzer Dauer oder bei unsicheren Ausgang</li></ru>
Statusschritte (Arbeitspaket) | Diese Verfahren misst Fertigstellung auf der Ebene des Arbeitspakets pauschal:<ru><li>0% - nicht begonnen</li><li>5% - begonnen</li><li>33% - weniger als die Hälfte bearbeitet</li><li>66% - mehr als die Hälfte bearbeitet</li><li>100% - fertiggestellt und abgenommen</li></ru>
Frei Schätzung | Der Fertigstellungsgrad eines Arbeitspaketes wird nach besten Wissen und Gewissen von den Verantwortlichen frei geschätzt

* Gegenwart: Wo bin ich?
* Ist-Werte sind für die Ermittlung von FSG nicht von Bedeutung
* Nicht zulässig: FSG-Methode zu einem AP darf nicht geändert werden
* Zulässig: Verfahren APs können gemischt werden
* 20/80
  * Nachteil: zu grob
  * Vorteil: schnell, keine Kommunikation, konfliktfrei
* MS-Project: Aufwandsbezogene Vorgänge werden zeitgesteuert erfasst
* FSG ist Grundlage für Earned Value Management

AP | Plan (=Pert) | Status | Ist-Wert | Methode | FSG
--- | --- | --- | --- | --- | ---
AP1 | 10 | fertig | 15 |    | 10
... | ... | ... | ... | 20/80 | ...
APn | 10 | angefangen | 3 | To Go 3/11 | 2,7

 