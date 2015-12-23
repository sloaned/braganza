var conomopoint = {};
var northwestterritory = {};
var twopennyloaf = {};
var wingaersheek = {};
var redrocks = {};
var westparrish = {};
var rustisland = {};
var mountann = {};
var fernwood = {};
var coolidgepoint = {};
var ravenswood = {};
var magnolia = {};
var hammondcastle = {};
var stagefortpark = {};
var annisquam = {};
var bayview = {};
var lanesville = {};
var halibutpoint = {};
var wheelerspoint = {};
var riverdale = {};
var dogtown = {};
var pigeonhill = {};
var thefort = {};
var cityhall = {};
var portageehill = {};
var blackburnpark = {};
var raccoonrock = {};
var pooleshill = {};
var bearskinneck = {};
var capepond = {};
var gaphead = {};
var landsend = {};
var thatcherisland = {};
var longbeach = {};
var goodharborbeach = {};
var statefishpier = {};
var bassrocks = {};
var rockyneck = {};
var easternpoint = {};

var water1 = {};
var water2 = {};
var water3 = {};
var water4 = {};
var water5 = {};
var water6 = {};
var water7 = {};
var water8 = {};
var water9 = {};
var water10 = {};
var water11 = {};
var water12 = {};
var water13 = {};
var water14 = {};
var water15 = {};
var water16 = {};
var water17 = {};
var water18 = {};
var water19 = {};
var water20 = {};
var water21 = {};
var water22 = {};
var water23 = {};
var water24 = {};
var water25 = {};
var water26 = {};
var water27 = {};
var water28 = {};
var water29 = {};
var water30 = {};
var water31 = {};
var water32 = {};
var water33 = {};
var water34 = {};
var water35 = {};
var water36 = {};
var water37 = {};
var water38 = {};
var water39 = {};

var regions = [];
regions.push(conomopoint);
regions.push(northwestterritory);
regions.push(twopennyloaf);
regions.push(wingaersheek);
regions.push(redrocks);
regions.push(westparrish);
regions.push(rustisland);
regions.push(mountann);
regions.push(fernwood);
regions.push(coolidgepoint);
regions.push(ravenswood);
regions.push(magnolia);
regions.push(stagefortpark);
regions.push(hammondcastle);
regions.push(annisquam);
regions.push(bayview);
regions.push(lanesville);
regions.push(halibutpoint);
regions.push(pigeonhill);
regions.push(dogtown);
regions.push(riverdale);
regions.push(wheelerspoint);
regions.push(thefort);
regions.push(cityhall);
regions.push(blackburnpark);
regions.push(raccoonrock);
regions.push(pooleshill);
regions.push(bearskinneck);
regions.push(gaphead);
regions.push(landsend);
regions.push(thatcherisland);
regions.push(capepond);
regions.push(longbeach);
regions.push(goodharborbeach);
regions.push(portageehill);
regions.push(statefishpier);
regions.push(rockyneck);
regions.push(bassrocks);
regions.push(easternpoint);
regions.push(water1);
regions.push(water2);
regions.push(water3);
regions.push(water4);
regions.push(water5);
regions.push(water6);
regions.push(water7);
regions.push(water8);
regions.push(water9);
regions.push(water10);
regions.push(water11);
regions.push(water12);
regions.push(water13);
regions.push(water14);
regions.push(water15);
regions.push(water16);
regions.push(water17);
regions.push(water18);
regions.push(water19);
regions.push(water20);
regions.push(water21);
regions.push(water22);
regions.push(water23);
regions.push(water24);
regions.push(water25);
regions.push(water26);
regions.push(water27);
regions.push(water28);
regions.push(water29);
regions.push(water30);
regions.push(water31);
regions.push(water32);
regions.push(water33);
regions.push(water34);
regions.push(water35);
regions.push(water36);
regions.push(water37);
regions.push(water38);
regions.push(water39);

var commandPosts = [];

commandPosts.push(wingaersheek);
commandPosts.push(hammondcastle);
commandPosts.push(stagefortpark);
commandPosts.push(thefort);
commandPosts.push(cityhall);
commandPosts.push(portageehill);
commandPosts.push(statefishpier);
commandPosts.push(easternpoint);
commandPosts.push(thatcherisland);
commandPosts.push(bearskinneck);
commandPosts.push(halibutpoint);
commandPosts.push(dogtown);
commandPosts.push(annisquam);

var stagingAreas = [];

stagingAreas.push(conomopoint);
stagingAreas.push(redrocks);
stagingAreas.push(mountann);
stagingAreas.push(coolidgepoint);
stagingAreas.push(water2);
stagingAreas.push(water3);
stagingAreas.push(water10);
stagingAreas.push(water11);
stagingAreas.push(water19);
stagingAreas.push(water24);
stagingAreas.push(water23);
stagingAreas.push(water29);
stagingAreas.push(water30);

for(var i = 0; i < regions.length; i++)
{
	regions[i].soldiers = 0;
	regions[i].cannons = 0;
	regions[i].captain = false;
	regions[i].color = "";
}

for(var i = 0; i < 39; i++)
{
	regions[i].type = "land";
}
for(var i = 39; i < regions.length; i++)
{
	regions[i].type = "sea";
	regions[i].boat = false;
}

conomopoint.name = "conomopoint";
conomopoint.attack = [northwestterritory, westparrish, redrocks, water1, water36];
conomopoint.landTravel = [northwestterritory, westparrish, redrocks];
conomopoint.seaTravel = [water1, water36];

northwestterritory.name = "northwestterritory";
northwestterritory.attack = [conomopoint, westparrish, rustisland, twopennyloaf, wingaersheek, water1];
northwestterritory.landTravel =[conomopoint, westparrish, rustisland, twopennyloaf, wingaersheek];
northwestterritory.seaTravel = [water1];

twopennyloaf.name = "twopennyloaf";
twopennyloaf.attack = [northwestterritory, wingaersheek, water1, water3, water4, water5];
twopennyloaf.landTravel = [northwestterritory, wingaersheek];
twopennyloaf.seaTravel = [water1, water3, water4, water5];

wingaersheek.name = "wingaersheek";
wingaersheek.attack = [twopennyloaf, northwestterritory, rustisland, water7, water35];
wingaersheek.landTravel = [twopennyloaf, northwestterritory, rustisland];
wingaersheek.seaTravel = [water7, water35];
wingaersheek.flag = "";

redrocks.name = "redrocks";
redrocks.attack = [conomopoint, westparrish, fernwood, mountann];
redrocks.landTravel = [conomopoint, westparrish, fernwood, mountann];
redrocks.seaTravel = [];

westparrish.name = "westparrish";
westparrish.attack = [conomopoint,northwestterritory,rustisland,redrocks, fernwood];
westparrish.landTravel = [conomopoint,northwestterritory,rustisland,redrocks, fernwood];
westparrish.seaTravel = [];

rustisland.name = "rustisland";
rustisland.attack = [northwestterritory, wingaersheek, westparrish, fernwood, wheelerspoint, water34, water35];
rustisland.landTravel = [northwestterritory, wingaersheek, westparrish, fernwood, wheelerspoint];
rustisland.seaTravel = [water34, water35];

mountann.name = "mountann";
mountann.attack = [redrocks, fernwood, ravenswood, coolidgepoint];
mountann.attack = [redrocks, fernwood, ravenswood, coolidgepoint];
mountann.landTravel = [redrocks, fernwood, ravenswood, coolidgepoint];
mountann.seaTravel = [];

fernwood.name = "fernwood";
fernwood.attack = [rustisland, westparrish, redrocks, mountann, ravenswood, stagefortpark, water34];
fernwood.landTravel = [rustisland, westparrish, redrocks, mountann, ravenswood, stagefortpark];
fernwood.seaTravel = [water34];

coolidgepoint.name = "coolidgepoint";
coolidgepoint.attack = [mountann, ravenswood, magnolia, water38];
coolidgepoint.landTravel = [mountann, ravenswood, magnolia];
coolidgepoint.seaTravel = [water38];

ravenswood.name = "ravenswood";
ravenswood.attack = [mountann, fernwood, stagefortpark, hammondcastle, magnolia, coolidgepoint];
ravenswood.landTravel = [mountann, fernwood, stagefortpark, hammondcastle, magnolia, coolidgepoint];
ravenswood.seaTravel = [];

stagefortpark.name = "stagefortpark";
stagefortpark.attack = [fernwood, ravenswood, hammondcastle, thefort, water33, water34];
stagefortpark.landTravel = [fernwood, ravenswood, hammondcastle, thefort];
stagefortpark.seaTravel = [water33, water34];

magnolia.name = "magnolia";
magnolia.attack = [coolidgepoint, ravenswood, hammondcastle, water29, water30, water38];
magnolia.landTravel = [coolidgepoint, ravenswood, hammondcastle];
magnolia.seaTravel = [water38];
magnolia.flag = "";

hammondcastle.name = "hammondcastle";
hammondcastle.attack = [magnolia, ravenswood, stagefortpark, water31, water32];
hammondcastle.landTravel = [magnolia, ravenswood, stagefortpark];
hammondcastle.seaTravel = [];
hammondcastle.flag = "";

annisquam.name = "annisquam";
annisquam.attack = [riverdale, dogtown, bayview, water7, water35];
annisquam.landTravel = [riverdale, dogtown, bayview];
annisquam.seaTravel = [water7, water35];
annisquam.flag = "";

bayview.name = "bayview";
bayview.attack = [annisquam, dogtown, lanesville, water7];
bayview.landTravel = [annisquam, dogtown, lanesville];
bayview.seaTravel = [water7];

lanesville.name = "lanesville";
lanesville.attack = [bayview, dogtown, pigeonhill, halibutpoint, water6, water8];
lanesville.landTravel = [bayview, dogtown, pigeonhill, halibutpoint];
lanesville.seaTravel = [water6];

halibutpoint.name = "halibutpoint";
halibutpoint.attack = [lanesville, pigeonhill, water9];
halibutpoint.landTravel = [lanesville, pigeonhill];
halibutpoint.seaTravel = [];
halibutpoint.flag = "";

wheelerspoint.name = "wheelerspoint";
wheelerspoint.attack = [rustisland, riverdale, thefort, cityhall, water34, water35];
wheelerspoint.landTravel = [rustisland, riverdale, thefort, cityhall];
wheelerspoint.seaTravel = [water34, water35];

riverdale.name = "riverdale";
riverdale.attack = [wheelerspoint, annisquam, dogtown, blackburnpark, cityhall, water35];
riverdale.landTravel = [wheelerspoint, annisquam, dogtown, blackburnpark, cityhall];
riverdale.seaTravel = [water35];

dogtown.name = "dogtown";
dogtown.attack = [riverdale, annisquam, bayview, lanesville, pigeonhill, pooleshill, raccoonrock, blackburnpark];
dogtown.landTravel = [riverdale, annisquam, bayview, lanesville, pigeonhill, pooleshill, raccoonrock, blackburnpark];
dogtown.seaTravel = [];
dogtown.flag = "";

pigeonhill.name = "pigeonhill";
pigeonhill.attack = [dogtown, lanesville, halibutpoint, bearskinneck, pooleshill, water9, water12, water13];
pigeonhill.landTravel = [dogtown, lanesville, halibutpoint, bearskinneck, pooleshill];
pigeonhill.seaTravel = [water13];

thefort.name = "thefort";
thefort.attack = [wheelerspoint, cityhall, statefishpier, stagefortpark, water33, water34];
thefort.landTravel = [wheelerspoint, cityhall, statefishpier, stagefortpark];
thefort.seaTravel = [water33, water34];
thefort.flag = "";

cityhall.name = "cityhall";
cityhall.attack = [wheelerspoint, riverdale, blackburnpark, portageehill, statefishpier, thefort];
cityhall.landTravel = [wheelerspoint, riverdale, blackburnpark, portageehill, statefishpier, thefort];
cityhall.seaTravel = [];
cityhall.flag = "";

blackburnpark.name = "blackburnpark";
blackburnpark.attack = [riverdale, dogtown, raccoonrock, capepond, goodharborbeach, portageehill, cityhall];
blackburnpark.landTravel = [riverdale, dogtown, raccoonrock, capepond, goodharborbeach, portageehill, cityhall];
blackburnpark.seaTravel = [];

raccoonrock.name = "raccoonrock";
raccoonrock.attack = [dogtown, pooleshill, capepond, blackburnpark];
raccoonrock.landTravel = [dogtown, pooleshill, capepond, blackburnpark];
raccoonrock.seaTravel = [];

pooleshill.name = "pooleshill";
pooleshill.attack = [dogtown, pigeonhill, bearskinneck, capepond, raccoonrock];
pooleshill.landTravel = [dogtown, pigeonhill, bearskinneck, capepond, raccoonrock];
pooleshill.seaTravel = [];

bearskinneck.name = "bearskinneck";
bearskinneck.attack = [pooleshill, pigeonhill, gaphead, capepond, water14];
bearskinneck.landTravel = [pooleshill, pigeonhill, gaphead, capepond];
bearskinneck.seaTravel = [water14];
bearskinneck.flag = "";

gaphead.name = "gaphead";
gaphead.attack = [capepond, bearskinneck, longbeach, landsend, water14, water15];
gaphead.landTravel = [capepond, bearskinneck, longbeach, landsend];
gaphead.seaTravel = [water14, water15];

landsend.name = "landsend";
landsend.attack = [gaphead, longbeach, water15, water16, water17, water18];
landsend.landTravel = [gaphead, longbeach];
landsend.seaTravel = [water15, water16, water17, water18];

thatcherisland.name = "thatcherisland";
thatcherisland.attack = [water16, water18, water19, water20];
thatcherisland.landTravel = [];
thatcherisland.seaTravel = [water16];
thatcherisland.flag = "";

longbeach.name = "longbeach";
longbeach.attack = [goodharborbeach, capepond, gaphead, landsend, water17];
longbeach.landTravel = [goodharborbeach, capepond, gaphead, landsend];
longbeach.seaTravel = [water17];

capepond.name = "capepond";
capepond.attack = [blackburnpark, raccoonrock, pooleshill, bearskinneck, gaphead, longbeach, goodharborbeach];
capepond.landTravel = [blackburnpark, raccoonrock, pooleshill, bearskinneck, gaphead, longbeach, goodharborbeach];
capepond.seaTravel = [];

goodharborbeach.name = "goodharborbeach";
goodharborbeach. attack = [bassrocks, statefishpier, portageehill, blackburnpark, capepond, longbeach, water17, water21];
goodharborbeach.landTravel = [bassrocks, statefishpier, portageehill, blackburnpark, capepond, longbeach];
goodharborbeach.seaTravel = [water17, water21];

portageehill.name = "portageehill";
portageehill.attack = [cityhall, blackburnpark, goodharborbeach, statefishpier];
portageehill.landTravel = [cityhall, blackburnpark, goodharborbeach, statefishpier];
portageehill.seaTravel = [];
portageehill.flag = "";

statefishpier.name = "statefishpier";
statefishpier.attack = [thefort, cityhall, portageehill, goodharborbeach, bassrocks, rockyneck, water33];
statefishpier.landTravel = [thefort, cityhall, portageehill, goodharborbeach, bassrocks, rockyneck];
statefishpier.seaTravel = [water33];
statefishpier.flag = "";

rockyneck.name = "rockyneck";
rockyneck.attack = [statefishpier, bassrocks, easternpoint, water33];
rockyneck.landTravel = [statefishpier, bassrocks, easternpoint];
rockyneck.seaTravel = [water33];

bassrocks.name = "bassrocks";
bassrocks.attack = [easternpoint, rockyneck, statefishpier, goodharborbeach, water21, water26];
bassrocks.landTravel = [easternpoint, rockyneck, statefishpier, goodharborbeach];
bassrocks.seaTravel = [];

easternpoint.name = "easternpoint";
easternpoint.attack = [rockyneck, bassrocks, water27, water31, water32, water33];
easternpoint.landTravel = [rockyneck, bassrocks];
easternpoint.seaTravel = [water27, water33];
easternpoint.flag = "";

water1.name = "water1";
water1.attack = [water2, water3, water36, conomopoint, northwestterritory, twopennyloaf];
water1.landTravel = [conomopoint, northwestterritory, twopennyloaf];
water1.seaTravel = [water2, water3, water36];

water2.name = "water2";
water2.attack = [water1, water3, water36];
water2.landTravel = [];
water2.seaTravel = [water1, water3, water36];

water3.name = "water3";
water3.attack = [water1, water2, water4, twopennyloaf];
water3.landTravel = [twopennyloaf];
water3.seaTravel = [water1, water2, water4];

water4.name = "water4";
water4.attack = [water3, water5, water6, water8, twopennyloaf];
water4.landTravel = [twopennyloaf];
water4.seaTravel = [water3, water5, water6, water8];

water5.name = "water5";
water5.attack = [water4, water6, water7, twopennyloaf];
water5.landTravel = [twopennyloaf];
water5.seaTravel = [water4, water6, water7];

water6.name = "water6";
water6.attack = [water4, water5, water7, water8, lanesville];
water6.landTravel = [lanesville];
water6.seaTravel = [water4, water5, water7, water8];

water7.name = "water7";
water7.attack = [water5, water6, water35, wingaersheek, annisquam, bayview];
water7.landTravel = [wingaersheek, annisquam, bayview];
water7.seaTravel = [water5, water6, water35];

water8.name = "water8";
water8.attack = [water4, water6, water9, lanesville];
water8.landTravel = [];
water8.seaTravel = [water4, water6, water9];

water9.name = "water9";
water9.attack = [water8, water10, water12, halibutpoint, pigeonhill];
water9.landTravel = [];
water9.seaTravel = [water8, water10, water12];

water10.name = "water10";
water10.attack = [water9, water11, water12, water37];
water10.landTravel = [];
water10.seaTravel = [water9, water11, water12, water37];

water11.name = "water11";
water11.attack = [water10, water12, water15, water37];
water11.landTravel = [];
water11.seaTravel = [water10, water12, water15, water37];

water12.name = "water12";
water12.attack = [water9, water10, water11, water13, water14, water15, pigeonhill];
water12.landTravel = [];
water12.seaTravel = [water9, water10, water11, water13, water14, water15];

water13.name = "water13";
water13.attack = [water12, water14, pigeonhill];
water13.landTravel = [pigeonhill];
water13.seaTravel = [water12, water14];

water14.name = "water14";
water14.attack = [water12, water13, water15, bearskinneck, gaphead];
water14.landTravel = [bearskinneck, gaphead];
water14.seaTravel = [water12, water13, water15];

water15.name = "water15";
water15.attack = [water11, water12, water14, water16];
water15.landTravel = [];
water15.seaTravel = [water11, water12, water14, water16];

water16.name = "water16";
water16.attack = [water15, water18, thatcherisland, landsend];
water16.landTravel = [thatcherisland, landsend];
water16.seaTravel = [water15, water18];

water17.name = "water17";
water17.attack = [water18, water21, goodharborbeach, longbeach, landsend];
water17.landTravel = [goodharborbeach, longbeach, landsend];
water17.seaTravel = [water18, water21];

water18.name = "water18";
water18.attack = [water16, water17, water19, water21, water22, water23, landsend, thatcherisland];
water18.landTravel = [landsend];
water18.seaTravel = [water16, water17, water19, water21, water22, water23];

water19.name = "water19";
water19.attack = [water18, water20, water23, water24, water25];
water19.landTravel = [];
water19.seaTravel = [water18, water20, water23, water24, water25];

water20.name = "water20";
water20.attack = [water19, water25, water39, thatcherisland];
water20.landTravel = [];
water20.seaTravel = [water19, water25, water39];

water21.name = "water21";
water21.attack = [water17, water18, water22, water26, goodharborbeach, bassrocks];
water21.landTravel = [goodharborbeach];
water21.seaTravel = [water17, water18, water22, water26];

water22.name = "water22";
water22.attack = [water18, water21, water23, water26, water27, water28];
water22.landTravel = [];
water22.seaTravel = [water18, water21, water23, water26, water27, water28];

water23.name = "water23";
water23.attack = [water18, water19, water22, water24, water28];
water23.landTravel = [];
water23.seaTravel = [water18, water19, water22, water24, water28];

water24.name = "water24";
water24.attack = [water19, water23, water25, water28];
water24.landTravel = [];
water24.seaTravel = [water19, water23, water25, water28];

water25.name = "water25";
water25.attack = [water19, water20, water24, water39];
water25.landTravel = [];
water25.seaTravel = [water19, water20, water24, water39];

water26.name = "water26";
water26.attack = [water21, water22, water27, bassrocks];
water26.landTravel = [];
water26.seaTravel = [water21, water22, water27];

water27.name = "water27";
water27.attack = [water22, water26, water28, water31, easternpoint];
water27.landTravel = [easternpoint];
water27.seaTravel = [water22, water26, water28, water31];

water28.name = "water28";
water28.attack = [water22, water23, water24, water27, water31];
water28.landTravel = [];
water28.seaTravel = [water22, water23, water24, water27, water31];

water29.name = "water29";
water29.attack = [water30, water38, magnolia];
water29.landTravel = [];
water29.seaTravel = [water30, water38];

water30.name = "water30";
water30.attack = [water29, water31, magnolia];
water30.landTravel = [];
water30.seaTravel = [water29, water31];

water31.name = "water31";
water31.attack = [water27, water28, water30, water32, hammondcastle, easternpoint];
water31.landTravel = [];
water31.seaTravel = [water27, water28, water30, water32];

water32.name = "water32";
water32.attack = [water31, water33, hammondcastle, easternpoint];
water32.landTravel = [];
water32.seaTravel = [water31, water33];

water33.name = "water33";
water33.attack = [water32, water34, stagefortpark, thefort, statefishpier, rockyneck, easternpoint];
water33.landTravel = [stagefortpark, thefort, statefishpier, rockyneck, easternpoint];
water33.seaTravel = [water32, water34];

water34.name = "water34";
water34.attack = [water33, water35, stagefortpark, fernwood, rustisland, wheelerspoint, thefort];
water34.landTravel = [stagefortpark, fernwood, rustisland, wheelerspoint, thefort];
water34.seaTravel = [water33, water35];

water35.name = "water35";
water35.attack = [water7, water34, wingaersheek, rustisland, wheelerspoint, riverdale, annisquam];
water35.landTravel = [wingaersheek, rustisland, wheelerspoint, riverdale, annisquam];
water35.seaTravel = [water7, water34];

water36.name = "water36";
water36.attack = [water1, water2, conomopoint];
water36.landTravel = [conomopoint];
water36.seaTravel = [water1, water2];

water37.name = "water37";
water37.attack = [water10, water11];
water37.landTravel = [];
water37.seaTravel = [water10, water11];

water38.name = "water38";
water38.attack = [water29, coolidgepoint, magnolia];
water38.landTravel = [coolidgepoint, magnolia];
water38.seaTravel = [water29];

water39.name = "water39";
water39.attack = [water20, water25];
water39.landTravel = [];
water39.seaTravel = [water20, water25];



