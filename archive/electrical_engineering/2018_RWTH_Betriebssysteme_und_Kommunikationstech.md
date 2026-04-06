# Betriebssysteme und Kommunikationstechnik

http://pages.cs.wisc.edu/~remzi/OSTEP/

## Literatur

* A. Silberschatz, G. Gagne, P. B. Galvin: Operating System Concepts. 8th Edition, Wiley, 2008.
* A. S. Tanenbaum: Modern Operating Systems. 3rd Edition, Prentice Hall, 2008.
* O. Spaniol: Systemprogrammierung - Skript zur Vorlesung an der RWTH Aachen. Aachener Beiträge zur Informatik, Band 14. 3. Auflage, Mainz-Verlag, 2002.
* Zusätzlich: Folien zur Vorlesung

## RWTH

* Aufgaben und Struktur von Betriebssystemen
* Das Betriebssystem Unix
* Systemaufrufe und Shellprogrammierung
* Einführung in die Programmiersprache C
* Prozessverwaltung: Prozesse, Threads und Interprozesskommunikation
* Prozess-Synchronisation, Nebenläufigkeit und Deadlocks
* CPU-Scheduling
* Speicherverwaltung: Segmentierung, Paging, Fragmentierung, virtueller Speicher
* Stack- und Heap-Verwaltung, Garbage Collection
* Dateisystem und Rechteverwaltung
* I/O-System
* Verteilte Systeme
* Socket-Programmierung

## Wikipedia

### Betriebssysteme

* Aufgaben eines Betriebssystems
  * Speicherverwaltung
    * Verwaltung der Systemressource Hauptspeicher.
    * Protokollierung der Speichernutzung
    * Reservierung und Freigabe von Speicher.
  * (Prozess)-Verwaltung
    * Überwachung der Speicherzugriffe und gegebenenfalls Beenden von Prozessen bei einer Schutzverletzung.
    * Erzeugung neuer Prozesse (entweder auf Anforderung des Betriebssystems oder auf Aufforderung anderer schon existierender Prozesse) und Reservierung des von den Prozessen benötigten Speichers.
  * Kommunikation und Synchronisation von Prozessen untereinander (Interprozesskommunikation)
    * Geräte- und Dateiverwaltung
    * Effiziente Zuweisung von Ein-/Ausgabegeräten und Vermittlungseinheiten (Datenkanäle, Steuereinheiten), Vermeidung von Konflikten
    * Initiierung, Überwachung der Ausführung, Terminierung von Ein-/Ausgabevorgängen.
    * Verwaltung des Dateisystems. Erzeugung eines Namensraums mit zugehörigen Speicherobjekten und gegebenenfalls weiteren Objekten.
  * Rechteverwaltung. Voneinander unabhängige Benutzer/Programme dürfen sich gegenseitig nicht stören.
  * Abstraktion
    * Verbergen der Komplexität der Maschine vor dem Anwender
    * Abstraktion des Maschinenbegriffes (nach Coy):
    * Reale Maschine = Zentraleinheit + Geräte (Hardware)
    * Abstrakte Maschine = Reale Maschine + Betriebssystem
    * Benutzermaschine = Abstrakte Maschine + Anwendungsprogramm
* Definition Tanenbaum: OS = Kernel
* Entwicklungsstufen => Todo am PC
  * Lochkarten 19Jh bis 1960
    * Keine externen Speichermedien
    * Lochkarte hatte ein Fassungsvermögen von 80 Byte
    * 80MB = 1mio Lochkarten, 2500kg
    * Todo: Abbildung malen
  * Multiprogrammed Batch Systems

#fleeting