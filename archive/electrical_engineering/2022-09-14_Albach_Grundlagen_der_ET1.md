# Manfred Albach - Grundlagen der Elektrotechnik 1

- Author: Manfred Albach
- Title: Grundlagen der Elektrotechnik 1 - Erfahrungssätze, Bauelemente, Gleichstromschaltungen

## Vorwort

- Elektrotechnik besteht aus der Nutzbarmachung der aus der Physik gewonnenen Erkenntnisse über die elektromagnetischen Erscheinungen und deren Gesetzmäßigkeiten.

## 1. Das elektrostatische Feld

- Existenz elektrische Ladung -> Elektromagnetische Erscheinungen
- Anordnung von ruhenden Ladungen -> Elektrostatisches Feld
- #Coulomb 'sche Gesetz: Beschreibt Kraftwirkung zwischen ruhenden Ladungen
- Kapazität: Aus Feldverteilung abgeleitete integrale Größe, die die Fähigkeit einer Anordnung beschreibt, elektrische Energie zu speichern
- **Lernziele**
  - Nach Durcharbeiten dieses Kapitels und dem Lösen der Übungsaufgaben werden Sie in der Lage sein,
    - mithilfe des #Coulomb 'schen Gesetzes Kräfte auf Ladungen zu berechnen,
    - das elektrostatische Feld für einfache Ladungsanordnungen zu berechnen,
    - die zugehörigen Äquipotentialflächen und Feldlinien darzustellen,
    - die elektrische Spannung aus den Feldgrößen zu bestimmen,
    - das Verhalten der Feldgrößen an Sprungstellen der Materialeigenschaften zu bestimmen,
    - die Kapazität von einfachen Leiteranordnungen zu berechnen,
    - die Zusammenschaltung von Kondensatoren zu vereinfachen sowie
    - die im elektrostatischen Feld gespeicherte Energie zu berechnen.

### 1.1 Die elektrische Ladung

- Größenordnungen #Bohr 'sches Atommodell:

$$Kerndurchmesser: 10^{-14}m$$
$$Elektron: 10^{-15}m$$
$$Hülle: 10^{-10}m$$

- Anzahl der Protonen bzw. Elektronen: Ordnungszahl
- Im Kern enthaltende Protonen und Neutronen: Nukleonen
- Ladungen sind stets ein Vielfache der Elementarladung
- Im abgeschlossenen System ist die Summe aller Ladungen stets konstant

### 1.2 Das Colomb'sche Gesetzt

- #Coulomb 'sche Gesetzt

$$\vec{F}=\frac{1}{4\pi\epsilon_0}\frac{Q_1Q_2}{r^2}$$
$$\vec{F}\text{ := Kraft}$$
$$Q_1\text{ := Ladung 1}$$
$$Q_2\text{ := Ladung 2}$$
$$r\text{ := Abstand zwischen Ladung 1 und 2}$$
$$\frac{1}{4\pi\epsilon_0}\text{ := Proportionalitätskonstante}$$
$$\epsilon_0 = 8,854\cdot10^{-12}\frac{As}{Vm}\text{ := elektrische Feldkonstante (Dielektrizitätskonstante des Vakuums}$$

*Zwei Punktladungen gleichen Vorzeichens*

![Couloumb](../projects/EE/2022-11-19_CoulombGesetzt.drawio.png)

$$\vec{F_2}=\vec{e_r}\frac{1}{4\pi\epsilon_0}\frac{Q_1Q_2}{r^2}$$
$$\vec{e_r}\text{ := Einheitsvektor}$$

*Beziehung zwischen Kraft `F` und Abstand `r`:*

![Couloumb](../projects/EE/2022-11-19_CoulombLaw_Online_Universaldenker.png)

## 1.3 Elektrische Feldstärke

$$\vec{F_2}=\vec{e_r}\frac{1}{4\pi\epsilon_0}\frac{Q_1Q_2}{r^2}=\vec{E_1}*Q_2$$
$$\vec{E_1}=\vec{e_r}\frac{Q_1}{4\pi\epsilon_0r^2}\text{ ; Einheit }[\frac{V}{m}]$$
$$\vec{E_1}\text{ := Elektrische Feldstärke}$$

## 1.4 Überlagerung von Feldern

- Die Gesamtfeldstärke einer aus mehreren Ladungen bestehenden Anordnung ergibt sich durch lineare Überlagerung der Beiträge der Einzelladungen.

### Kugelkordinatensystem

Ein Kugelkoordinatensystem im dreidimensionalen euklidischen Raum wird festgelegt durch die Wahl

- O: Ursprung,
- r, der Radius, ist der Abstand des Punktes P von O, hiermit wird die Kugeloberfläche festgelegt, auf der sich P befindet.
- \vartheta oder \theta der Polarwinkel oder Poldistanzwinkel, ist der Winkel zwischen der Polrichtung und der Strecke OP, gezählt von 0
bis \pi  (0° bis 180°), hierdurch wird der Ort des Punktes P auf eine Kreislinie der Kugeloberfläche festgelegt.
- \varphi, der Azimutwinkel, ist der Winkel zwischen der Bezugsrichtung und der Orthogonalprojektion der Strecke OP, gezählt von -\pi  bis \pi  (−180° bis 180°) oder von 0 bis 2\pi  (0° bis 360°) gegen den Uhrzeigersinn. Hierdurch wird der Ort des Punktes P auf der Kreislinie eindeutig definiert.
- O ist Zentrum (Ursprung)P ist der Punkt, 

$$P=(r,\theta,\varphi)$$

![Kugelkoordinaten](../projects/EE/2023-01-28_Kugelkoordinaten_wikipedia.png)


---

- p.21

---

## Reference

- [Project R22EE](2022-09-03_Project_R22EE.md)
- [Grundlagen der Elektrotechnik](2022-09-14_R22EE_GET.md)
- [Formulars in Markdown](../projects/EE/2022-09-23_MarkdownFormulars.md)

#source