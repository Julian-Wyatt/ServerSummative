[ 0$1 -gt 0 ] || exit

while true; do
	git commit Database/recents.json -m "scheduled recents update"
	git commit Database/DC.json -m "scheduled DC update"
	git commit Database/Marvel.json -m "scheduled Marvel update"
	git commit Database/Disney.json -m "scheduled Disney update"
	git commit Database/FOX.json -m "scheduled FOX update"
	git commit Database/Netflix.json -m "scheduled Netflix update"
	git commit Database/Sony.json -m "scheduled Sony update"
	git commit Database/WarnerBros.json -m "scheduled WarnerBros update"
	git push
	sleep $1
done