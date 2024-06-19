import { useMemo } from 'react';

import anhan from 'libs/assets/src/assets/emojisSvg/Custom/anhan.png';
import che from 'libs/assets/src/assets/emojisSvg/Custom/che.png';
import da from 'libs/assets/src/assets/emojisSvg/Custom/da.png';
import frog_tear from 'libs/assets/src/assets/emojisSvg/Custom/frog_tear.png';
import o from 'libs/assets/src/assets/emojisSvg/Custom/o.png';
import panda from 'libs/assets/src/assets/emojisSvg/Custom/panda.png';
import pikachu_w from 'libs/assets/src/assets/emojisSvg/Custom/pikachu_w.png';

import dance from 'libs/assets/src/assets/emojisSvg/Custom/_dance_.gif';
import aawyeag from 'libs/assets/src/assets/emojisSvg/Custom/aawyeag.gif';
import amongus from 'libs/assets/src/assets/emojisSvg/Custom/amongus.gif';
import anime from 'libs/assets/src/assets/emojisSvg/Custom/anime.gif';
import awkwardkid from 'libs/assets/src/assets/emojisSvg/Custom/awkwardkid.gif';
import communist from 'libs/assets/src/assets/emojisSvg/Custom/communist.gif';
import discordrainbow from 'libs/assets/src/assets/emojisSvg/Custom/discordrainbow.gif';
import excusume from 'libs/assets/src/assets/emojisSvg/Custom/excusume.gif';
import hakcan from 'libs/assets/src/assets/emojisSvg/Custom/hakcan.gif';
import hehe from 'libs/assets/src/assets/emojisSvg/Custom/hehe.gif';
import huh from 'libs/assets/src/assets/emojisSvg/Custom/huh.png';
import lel from 'libs/assets/src/assets/emojisSvg/Custom/lel.png';
import madblob from 'libs/assets/src/assets/emojisSvg/Custom/madblob.gif';
import memes from 'libs/assets/src/assets/emojisSvg/Custom/memes.gif';
import meow from 'libs/assets/src/assets/emojisSvg/Custom/meow.gif';
import ordegaming from 'libs/assets/src/assets/emojisSvg/Custom/ordegaming.gif';
import pepeOK from 'libs/assets/src/assets/emojisSvg/Custom/pepeOK.png';
import pepecry from 'libs/assets/src/assets/emojisSvg/Custom/pepecry.png';
import pepelmfaoooo from 'libs/assets/src/assets/emojisSvg/Custom/pepelmfaoooo.gif';
import pepemad from 'libs/assets/src/assets/emojisSvg/Custom/pepemad.png';
import pepesaber from 'libs/assets/src/assets/emojisSvg/Custom/pepesaber.gif';
import pikachu from 'libs/assets/src/assets/emojisSvg/Custom/pikachu.gif';
import pokeball from 'libs/assets/src/assets/emojisSvg/Custom/pokeball.png';
import ranifiesta from 'libs/assets/src/assets/emojisSvg/Custom/ranifiesta.gif';
import sadcat from 'libs/assets/src/assets/emojisSvg/Custom/sadcat.png';
import verify from 'libs/assets/src/assets/emojisSvg/Custom/verify.gif';
import whatthe from 'libs/assets/src/assets/emojisSvg/Custom/whatthe.png';

import badminton from 'libs/assets/src/assets/emojisSvg/Activities/badminton.png';
import baseball from 'libs/assets/src/assets/emojisSvg/Activities/baseball.png';
import basketball from 'libs/assets/src/assets/emojisSvg/Activities/basketball.png';
import boomerang from 'libs/assets/src/assets/emojisSvg/Activities/boomerang.png';
import cricket_game from 'libs/assets/src/assets/emojisSvg/Activities/cricket_game.png';
import eightball from 'libs/assets/src/assets/emojisSvg/Activities/eightball.png';
import field_hockey from 'libs/assets/src/assets/emojisSvg/Activities/field_hockey.png';
import flying_disc from 'libs/assets/src/assets/emojisSvg/Activities/flying_disc.png';
import football from 'libs/assets/src/assets/emojisSvg/Activities/football.png';
import hockey from 'libs/assets/src/assets/emojisSvg/Activities/hockey.png';
import lacrosse from 'libs/assets/src/assets/emojisSvg/Activities/lacrosse.png';
import ping_pong from 'libs/assets/src/assets/emojisSvg/Activities/ping_pong.png';
import rugby_football from 'libs/assets/src/assets/emojisSvg/Activities/rugby_football.png';
import soccer from 'libs/assets/src/assets/emojisSvg/Activities/soccer.png';
import softball from 'libs/assets/src/assets/emojisSvg/Activities/softball.png';
import tennis from 'libs/assets/src/assets/emojisSvg/Activities/tennis.png';
import volleyball from 'libs/assets/src/assets/emojisSvg/Activities/volleyball.png';
import yo_yo from 'libs/assets/src/assets/emojisSvg/Activities/yo_yo.png';

import checkered_flag from 'libs/assets/src/assets/emojisSvg/Flags/checkered_flag.png';
import flag_ad from 'libs/assets/src/assets/emojisSvg/Flags/flag_ad.png';
import flag_af from 'libs/assets/src/assets/emojisSvg/Flags/flag_af.png';
import flag_ag from 'libs/assets/src/assets/emojisSvg/Flags/flag_ag.png';
import flag_ai from 'libs/assets/src/assets/emojisSvg/Flags/flag_ai.png';
import flag_al from 'libs/assets/src/assets/emojisSvg/Flags/flag_al.png';
import flag_ao from 'libs/assets/src/assets/emojisSvg/Flags/flag_ao.png';
import flag_aq from 'libs/assets/src/assets/emojisSvg/Flags/flag_aq.png';
import flag_as from 'libs/assets/src/assets/emojisSvg/Flags/flag_as.png';
import flag_ax from 'libs/assets/src/assets/emojisSvg/Flags/flag_ax.png';
import flag_black from 'libs/assets/src/assets/emojisSvg/Flags/flag_black.png';
import flag_dz from 'libs/assets/src/assets/emojisSvg/Flags/flag_dz.png';
import flag_white from 'libs/assets/src/assets/emojisSvg/Flags/flag_white.png';
import pirate_flag from 'libs/assets/src/assets/emojisSvg/Flags/pirate_flag.png';
import rainbow_flag from 'libs/assets/src/assets/emojisSvg/Flags/rainbow_flag.png';
import transgender_flag from 'libs/assets/src/assets/emojisSvg/Flags/transgender_flag.png';
import triangular_flag_on_post from 'libs/assets/src/assets/emojisSvg/Flags/triangular_flag_on_post.png';
import united_nations from 'libs/assets/src/assets/emojisSvg/Flags/united_nations.png';

import apple from 'libs/assets/src/assets/emojisSvg/Food/apple.png';
import banana from 'libs/assets/src/assets/emojisSvg/Food/banana.png';
import blueberries from 'libs/assets/src/assets/emojisSvg/Food/blueberries.png';
import cherries from 'libs/assets/src/assets/emojisSvg/Food/cherries.png';
import coconut from 'libs/assets/src/assets/emojisSvg/Food/coconut.png';
import grapes from 'libs/assets/src/assets/emojisSvg/Food/grapes.png';
import green_apple from 'libs/assets/src/assets/emojisSvg/Food/green_apple.png';
import kiwi from 'libs/assets/src/assets/emojisSvg/Food/kiwi.png';
import lemon from 'libs/assets/src/assets/emojisSvg/Food/lemon.png';
import mango from 'libs/assets/src/assets/emojisSvg/Food/mango.png';
import melon from 'libs/assets/src/assets/emojisSvg/Food/melon.png';
import peach from 'libs/assets/src/assets/emojisSvg/Food/peach.png';
import pear from 'libs/assets/src/assets/emojisSvg/Food/pear.png';
import pineapple from 'libs/assets/src/assets/emojisSvg/Food/pineapple.png';
import strawberry from 'libs/assets/src/assets/emojisSvg/Food/strawberry.png';
import tangerine from 'libs/assets/src/assets/emojisSvg/Food/tangerine.png';
import tomato from 'libs/assets/src/assets/emojisSvg/Food/tomato.png';
import watermelon from 'libs/assets/src/assets/emojisSvg/Food/watermelon.png';

import bear from 'libs/assets/src/assets/emojisSvg/Nature/bear.png';
import cat from 'libs/assets/src/assets/emojisSvg/Nature/cat.png';
import cow from 'libs/assets/src/assets/emojisSvg/Nature/cow.png';
import dog from 'libs/assets/src/assets/emojisSvg/Nature/dog.png';
import fox from 'libs/assets/src/assets/emojisSvg/Nature/fox.png';
import frog from 'libs/assets/src/assets/emojisSvg/Nature/frog.png';
import hamster from 'libs/assets/src/assets/emojisSvg/Nature/hamster.png';
import koala from 'libs/assets/src/assets/emojisSvg/Nature/koala.png';
import lion_face from 'libs/assets/src/assets/emojisSvg/Nature/lion_face.png';
import monkey_face from 'libs/assets/src/assets/emojisSvg/Nature/monkey_face.png';
import mouse from 'libs/assets/src/assets/emojisSvg/Nature/mouse.png';
import panda_face from 'libs/assets/src/assets/emojisSvg/Nature/panda_face.png';
import pig from 'libs/assets/src/assets/emojisSvg/Nature/pig.png';
import pig_nose from 'libs/assets/src/assets/emojisSvg/Nature/pig_nose.png';
import polar_bear from 'libs/assets/src/assets/emojisSvg/Nature/polar_bear.png';
import rabbit from 'libs/assets/src/assets/emojisSvg/Nature/rabbit.png';
import see_no_evil from 'libs/assets/src/assets/emojisSvg/Nature/see_no_evil.png';
import tiger from 'libs/assets/src/assets/emojisSvg/Nature/tiger.png';

import calling from 'libs/assets/src/assets/emojisSvg/Objects/calling.png';
import camera from 'libs/assets/src/assets/emojisSvg/Objects/camera.png';
import camera_with_flash from 'libs/assets/src/assets/emojisSvg/Objects/camera_with_flash.png';
import cd from 'libs/assets/src/assets/emojisSvg/Objects/cd.png';
import compression from 'libs/assets/src/assets/emojisSvg/Objects/compression.png';
import computer from 'libs/assets/src/assets/emojisSvg/Objects/computer.png';
import desktop from 'libs/assets/src/assets/emojisSvg/Objects/desktop.png';
import dvd from 'libs/assets/src/assets/emojisSvg/Objects/dvd.png';
import floppy_disk from 'libs/assets/src/assets/emojisSvg/Objects/floppy_disk.png';
import joystick from 'libs/assets/src/assets/emojisSvg/Objects/joystick.png';
import keyboard from 'libs/assets/src/assets/emojisSvg/Objects/keyboard.png';
import minidisc from 'libs/assets/src/assets/emojisSvg/Objects/minidisc.png';
import mobile_phone from 'libs/assets/src/assets/emojisSvg/Objects/mobile_phone.png';
import printer from 'libs/assets/src/assets/emojisSvg/Objects/printer.png';
import trackball from 'libs/assets/src/assets/emojisSvg/Objects/trackball.png';
import vhs from 'libs/assets/src/assets/emojisSvg/Objects/vhs.png';
import watch from 'libs/assets/src/assets/emojisSvg/Objects/watch.png';

import oneHundred from 'libs/assets/src/assets/emojisSvg/People/100.png';
import blush from 'libs/assets/src/assets/emojisSvg/People/blush.png';
import face_holding_back_tears from 'libs/assets/src/assets/emojisSvg/People/face_holding_back_tears.png';
import grin from 'libs/assets/src/assets/emojisSvg/People/grin.png';
import grinning from 'libs/assets/src/assets/emojisSvg/People/grinning.png';
import heart_eyes from 'libs/assets/src/assets/emojisSvg/People/heart_eyes.png';
import innocent from 'libs/assets/src/assets/emojisSvg/People/innocent.png';
import joy from 'libs/assets/src/assets/emojisSvg/People/joy.png';
import laughing from 'libs/assets/src/assets/emojisSvg/People/laughing.png';
import like from 'libs/assets/src/assets/emojisSvg/People/like.png';
import relaxed from 'libs/assets/src/assets/emojisSvg/People/relaxed.png';
import relieved from 'libs/assets/src/assets/emojisSvg/People/relieved.png';
import rofl from 'libs/assets/src/assets/emojisSvg/People/rofl.png';
import slight_smile from 'libs/assets/src/assets/emojisSvg/People/slight_smile.png';
import smile from 'libs/assets/src/assets/emojisSvg/People/smile.png';
import smiley from 'libs/assets/src/assets/emojisSvg/People/smiley.png';
import smiling_face_with_tear from 'libs/assets/src/assets/emojisSvg/People/smiling_face_with_tear.png';
import sweat_smile from 'libs/assets/src/assets/emojisSvg/People/sweat_smile.png';
import upside_down from 'libs/assets/src/assets/emojisSvg/People/upside_down.png';
import wink from 'libs/assets/src/assets/emojisSvg/People/wink.png';

import black_heart from 'libs/assets/src/assets/emojisSvg/Symbols/black_heart.png';
import blue_heart from 'libs/assets/src/assets/emojisSvg/Symbols/blue_heart.png';
import broken_heart from 'libs/assets/src/assets/emojisSvg/Symbols/broken_heart.png';
import brown_heart from 'libs/assets/src/assets/emojisSvg/Symbols/brown_heart.png';
import green_heart from 'libs/assets/src/assets/emojisSvg/Symbols/green_heart.png';
import grey_heart from 'libs/assets/src/assets/emojisSvg/Symbols/grey_heart.png';
import heart from 'libs/assets/src/assets/emojisSvg/Symbols/heart.png';
import heart_exclamation from 'libs/assets/src/assets/emojisSvg/Symbols/heart_exclamation.png';
import heartbeat from 'libs/assets/src/assets/emojisSvg/Symbols/heartbeat.png';
import heartpulse from 'libs/assets/src/assets/emojisSvg/Symbols/heartpulse.png';
import light_blue_heart from 'libs/assets/src/assets/emojisSvg/Symbols/light_blue_heart.png';
import orange_heart from 'libs/assets/src/assets/emojisSvg/Symbols/orange_heart.png';
import pink_heart from 'libs/assets/src/assets/emojisSvg/Symbols/pink_heart.png';
import purple_heart from 'libs/assets/src/assets/emojisSvg/Symbols/purple_heart.png';
import revolving_hearts from 'libs/assets/src/assets/emojisSvg/Symbols/revolving_hearts.png';
import two_hearts from 'libs/assets/src/assets/emojisSvg/Symbols/two_hearts.png';
import white_heart from 'libs/assets/src/assets/emojisSvg/Symbols/white_heart.png';
import yellow_heart from 'libs/assets/src/assets/emojisSvg/Symbols/yellow_heart.png';

import ambulance from 'libs/assets/src/assets/emojisSvg/Travel/ambulance.png';
import articulated_lorry from 'libs/assets/src/assets/emojisSvg/Travel/articulated_lorry.png';
import blue_car from 'libs/assets/src/assets/emojisSvg/Travel/blue_car.png';
import bus from 'libs/assets/src/assets/emojisSvg/Travel/bus.png';
import crutch from 'libs/assets/src/assets/emojisSvg/Travel/crutch.png';
import fire_engine from 'libs/assets/src/assets/emojisSvg/Travel/fire_engine.png';
import manual_wheelchair from 'libs/assets/src/assets/emojisSvg/Travel/manual_wheelchair.png';
import minibus from 'libs/assets/src/assets/emojisSvg/Travel/minibus.png';
import motorized_wheelchair from 'libs/assets/src/assets/emojisSvg/Travel/motorized_wheelchair.png';
import pickup_truck from 'libs/assets/src/assets/emojisSvg/Travel/pickup_truck.png';
import police_car from 'libs/assets/src/assets/emojisSvg/Travel/police_car.png';
import probing_cane from 'libs/assets/src/assets/emojisSvg/Travel/probing_cane.png';
import race_car from 'libs/assets/src/assets/emojisSvg/Travel/race_car.png';
import red_car from 'libs/assets/src/assets/emojisSvg/Travel/red_car.png';
import taxi from 'libs/assets/src/assets/emojisSvg/Travel/taxi.png';
import tractor from 'libs/assets/src/assets/emojisSvg/Travel/tractor.png';
import trolleybus from 'libs/assets/src/assets/emojisSvg/Travel/trolleybus.png';
import truck from 'libs/assets/src/assets/emojisSvg/Travel/truck.png';
function useDataEmojiSvg() {
	const emojiListPNG = [
		{ src: anhan, shortname: ':anhan:', category: 'Custom' },
		{ src: che, shortname: ':che:', category: 'Custom' },
		{ src: da, shortname: ':da:', category: 'Custom' },
		{ src: frog_tear, shortname: ':frog_tear:', category: 'Custom' },
		{ src: o, shortname: ':o:', category: 'Custom' },
		{ src: panda, shortname: ':panda:', category: 'Custom' },
		{ src: pikachu_w, shortname: ':pikachu_w:', category: 'Custom' },

		{ src: pepelmfaoooo, shortname: ':pepelmf:', category: 'Custom' },
		{ src: pepesaber, shortname: ':pepesaber:', category: 'Custom' },
		{ src: memes, shortname: ':memes:', category: 'Custom' },
		{ src: dance, shortname: ':dance:', category: 'Custom' },
		{ src: anime, shortname: ':anime:', category: 'Custom' },
		{ src: verify, shortname: ':verify:', category: 'Custom' },
		{ src: pepecry, shortname: ':pepecry:', category: 'Custom' },
		{ src: amongus, shortname: ':amongus:', category: 'Custom' },
		{ src: huh, shortname: ':huh:', category: 'Custom' },
		{ src: whatthe, shortname: ':whatthe:', category: 'Custom' },
		{ src: pepeOK, shortname: ':pepeOK:', category: 'Custom' },
		{ src: lel, shortname: ':lel:', category: 'Custom' },
		{ src: madblob, shortname: ':madblob:', category: 'Custom' },
		{ src: pikachu, shortname: ':pikachu:', category: 'Custom' },
		{ src: meow, shortname: ':meow:', category: 'Custom' },
		{ src: hehe, shortname: ':hehe:', category: 'Custom' },
		{ src: hakcan, shortname: ':hakcan:', category: 'Custom' },
		{ src: awkwardkid, shortname: ':awkward:', category: 'Custom' },
		{ src: pepemad, shortname: ':pepemad:', category: 'Custom' },
		{ src: communist, shortname: ':communist:', category: 'Custom' },
		{ src: ordegaming, shortname: ':ordegaming:', category: 'Custom' },
		{ src: ranifiesta, shortname: ':ranifiesta:', category: 'Custom' },
		{ src: pokeball, shortname: ':pokeball:', category: 'Custom' },
		{ src: aawyeag, shortname: ':aawyeag:', category: 'Custom' },
		{ src: discordrainbow, shortname: ':discordr:', category: 'Custom' },
		{ src: excusume, shortname: ':excusume:', category: 'Custom' },
		{ src: sadcat, shortname: ':sadcat:', category: 'Custom' },

		{ src: badminton, shortname: ':badminton:', category: 'Activities' },
		{ src: baseball, shortname: ':baseball:', category: 'Activities' },
		{ src: basketball, shortname: ':basketball:', category: 'Activities' },
		{ src: boomerang, shortname: ':boomerang:', category: 'Activities' },
		{ src: cricket_game, shortname: ':cricket_game:', category: 'Activities' },
		{ src: eightball, shortname: ':eightball:', category: 'Activities' },
		{ src: field_hockey, shortname: ':field_hockey:', category: 'Activities' },
		{ src: flying_disc, shortname: ':flying_disc:', category: 'Activities' },
		{ src: football, shortname: ':football:', category: 'Activities' },
		{ src: hockey, shortname: ':hockey:', category: 'Activities' },
		{ src: lacrosse, shortname: ':lacrosse:', category: 'Activities' },
		{ src: ping_pong, shortname: ':ping_pong:', category: 'Activities' },
		{ src: rugby_football, shortname: ':rugby_f:', category: 'Activities' },
		{ src: soccer, shortname: ':soccer:', category: 'Activities' },
		{ src: softball, shortname: ':softball:', category: 'Activities' },
		{ src: tennis, shortname: ':tennis:', category: 'Activities' },
		{ src: volleyball, shortname: ':volleyball:', category: 'Activities' },
		{ src: yo_yo, shortname: ':yo_yo:', category: 'Activities' },
		{ src: checkered_flag, shortname: ':checkered_f:', category: 'Flags' },
		{ src: flag_ad, shortname: ':flag_ad:', category: 'Flags' },
		{ src: flag_af, shortname: ':flag_af:', category: 'Flags' },
		{ src: flag_ag, shortname: ':flag_ag:', category: 'Flags' },
		{ src: flag_ai, shortname: ':flag_ai:', category: 'Flags' },
		{ src: flag_al, shortname: ':flag_al:', category: 'Flags' },
		{ src: flag_ao, shortname: ':flag_ao:', category: 'Flags' },
		{ src: flag_aq, shortname: ':flag_aq:', category: 'Flags' },
		{ src: flag_as, shortname: ':flag_as:', category: 'Flags' },
		{ src: flag_ax, shortname: ':flag_ax:', category: 'Flags' },
		{ src: flag_black, shortname: ':flag_black:', category: 'Flags' },
		{ src: flag_dz, shortname: ':flag_dz:', category: 'Flags' },
		{ src: flag_white, shortname: ':flag_white:', category: 'Flags' },
		{ src: pirate_flag, shortname: ':pirate_flag:', category: 'Flags' },
		{ src: rainbow_flag, shortname: ':rainbow_flag:', category: 'Flags' },
		{ src: transgender_flag, shortname: ':trans_flag:', category: 'Flags' },
		{ src: triangular_flag_on_post, shortname: ':triangu:', category: 'Flags' },
		{ src: united_nations, shortname: ':united_n:', category: 'Flags' },
		{ src: apple, shortname: ':apple:', category: 'Food' },
		{ src: banana, shortname: ':banana:', category: 'Food' },
		{ src: blueberries, shortname: ':blueberr:', category: 'Food' },
		{ src: cherries, shortname: ':cherries:', category: 'Food' },
		{ src: coconut, shortname: ':coconut:', category: 'Food' },
		{ src: grapes, shortname: ':grapes:', category: 'Food' },
		{ src: green_apple, shortname: ':green_a:', category: 'Food' },
		{ src: kiwi, shortname: ':kiwi:', category: 'Food' },
		{ src: lemon, shortname: ':lemon:', category: 'Food' },
		{ src: mango, shortname: ':mango:', category: 'Food' },
		{ src: melon, shortname: ':melon:', category: 'Food' },
		{ src: peach, shortname: ':peach:', category: 'Food' },
		{ src: pear, shortname: ':pear:', category: 'Food' },
		{ src: pineapple, shortname: ':pineapple:', category: 'Food' },
		{ src: strawberry, shortname: ':strawberry:', category: 'Food' },
		{ src: tangerine, shortname: ':tangerine:', category: 'Food' },
		{ src: tomato, shortname: ':tomato:', category: 'Food' },
		{ src: watermelon, shortname: ':watermelon:', category: 'Food' },
		{ src: bear, shortname: ':bear:', category: 'Nature' },
		{ src: cat, shortname: ':cat:', category: 'Nature' },
		{ src: cow, shortname: ':cow:', category: 'Nature' },
		{ src: dog, shortname: ':dog:', category: 'Nature' },
		{ src: fox, shortname: ':fox:', category: 'Nature' },
		{ src: frog, shortname: ':frog:', category: 'Nature' },
		{ src: hamster, shortname: ':hamster:', category: 'Nature' },
		{ src: koala, shortname: ':koala:', category: 'Nature' },
		{ src: lion_face, shortname: ':lion_face:', category: 'Nature' },
		{ src: monkey_face, shortname: ':monkey_face:', category: 'Nature' },
		{ src: mouse, shortname: ':mouse:', category: 'Nature' },
		{ src: panda_face, shortname: ':panda_face:', category: 'Nature' },
		{ src: pig, shortname: ':pig:', category: 'Nature' },
		{ src: pig_nose, shortname: ':pig_nose:', category: 'Nature' },
		{ src: polar_bear, shortname: ':polar_bear:', category: 'Nature' },
		{ src: rabbit, shortname: ':rabbit:', category: 'Nature' },
		{ src: see_no_evil, shortname: ':see_no:', category: 'Nature' },
		{ src: tiger, shortname: ':tiger:', category: 'Nature' },
		{ src: calling, shortname: ':calling:', category: 'Objects' },
		{ src: camera, shortname: ':camera:', category: 'Objects' },
		{ src: camera_with_flash, shortname: ':camera_w_f:', category: 'Objects' },
		{ src: cd, shortname: ':cd:', category: 'Objects' },
		{ src: compression, shortname: ':compression:', category: 'Objects' },
		{ src: computer, shortname: ':computer:', category: 'Objects' },
		{ src: desktop, shortname: ':desktop:', category: 'Objects' },
		{ src: dvd, shortname: ':dvd:', category: 'Objects' },
		{ src: floppy_disk, shortname: ':floppy_d:', category: 'Objects' },
		{ src: joystick, shortname: ':joystick:', category: 'Objects' },
		{ src: keyboard, shortname: ':keyboard:', category: 'Objects' },
		{ src: minidisc, shortname: ':minidisc:', category: 'Objects' },
		{ src: mobile_phone, shortname: ':mobile_phone:', category: 'Objects' },
		{ src: printer, shortname: ':printer:', category: 'Objects' },
		{ src: trackball, shortname: ':trackball:', category: 'Objects' },
		{ src: vhs, shortname: ':vhs:', category: 'Objects' },
		{ src: watch, shortname: ':watch:', category: 'Objects' },
		{ src: blush, shortname: ':blush:', category: 'People' },
		{ src: face_holding_back_tears, shortname: ':face_tears:', category: 'People' },
		{ src: grin, shortname: ':grin:', category: 'People' },
		{ src: grinning, shortname: ':grinning:', category: 'People' },
		{ src: heart_eyes, shortname: ':heart_eyes:', category: 'People' },
		{ src: innocent, shortname: ':innocent:', category: 'People' },
		{ src: joy, shortname: ':joy:', category: 'People' },
		{ src: laughing, shortname: ':laughing:', category: 'People' },
		{ src: relaxed, shortname: ':relaxed:', category: 'People' },
		{ src: relieved, shortname: ':relieved:', category: 'People' },
		{ src: rofl, shortname: ':rofl:', category: 'People' },
		{ src: slight_smile, shortname: ':slight_s:', category: 'People' },
		{ src: smile, shortname: ':smile:', category: 'People' },
		{ src: smiley, shortname: ':smiley:', category: 'People' },
		{ src: smiling_face_with_tear, shortname: ':smiling_tear:', category: 'People' },
		{ src: sweat_smile, shortname: ':sweat_smile:', category: 'People' },
		{ src: upside_down, shortname: ':upside_down:', category: 'People' },
		{ src: wink, shortname: ':wink:', category: 'People' },
		{ src: oneHundred, shortname: ':100:', category: 'People' },
		{ src: like, shortname: ':like:', category: 'People' },
		{ src: black_heart, shortname: ':black_heart:', category: 'Symbols' },
		{ src: blue_heart, shortname: ':blue_heart:', category: 'Symbols' },
		{ src: broken_heart, shortname: ':broken_heart:', category: 'Symbols' },
		{ src: brown_heart, shortname: ':brown_heart:', category: 'Symbols' },
		{ src: green_heart, shortname: ':green_heart:', category: 'Symbols' },
		{ src: grey_heart, shortname: ':grey_heart:', category: 'Symbols' },
		{ src: heart, shortname: ':heart:', category: 'Symbols' },
		{ src: heart_exclamation, shortname: ':heart_e:', category: 'Symbols' },
		{ src: heartbeat, shortname: ':heartbeat:', category: 'Symbols' },
		{ src: heartpulse, shortname: ':heartpulse:', category: 'Symbols' },
		{ src: light_blue_heart, shortname: ':light_:', category: 'Symbols' },
		{ src: orange_heart, shortname: ':o_heart:', category: 'Symbols' },
		{ src: pink_heart, shortname: ':pink_heart:', category: 'Symbols' },
		{ src: purple_heart, shortname: ':p_heart:', category: 'Symbols' },
		{ src: revolving_hearts, shortname: ':r_hearts:', category: 'Symbols' },
		{ src: two_hearts, shortname: ':two_hearts:', category: 'Symbols' },
		{ src: white_heart, shortname: ':white_heart:', category: 'Symbols' },
		{ src: yellow_heart, shortname: ':yellow_heart:', category: 'Symbols' },
		{ src: ambulance, shortname: ':ambulance:', category: 'Travel' },
		{ src: articulated_lorry, shortname: ':ar_lorry:', category: 'Travel' },
		{ src: blue_car, shortname: ':blue_car:', category: 'Travel' },
		{ src: bus, shortname: ':bus:', category: 'Travel' },
		{ src: crutch, shortname: ':crutch:', category: 'Travel' },
		{ src: fire_engine, shortname: ':f_engine:', category: 'Travel' },
		{ src: minibus, shortname: ':minibus:', category: 'Travel' },
		{ src: manual_wheelchair, shortname: ':m_wheel:', category: 'Travel' },
		{ src: motorized_wheelchair, shortname: ':motor_wheel:', category: 'Travel' },
		{ src: pickup_truck, shortname: ':pickup_truck:', category: 'Travel' },
		{ src: police_car, shortname: ':police_car:', category: 'Travel' },
		{ src: probing_cane, shortname: ':probing_cane:', category: 'Travel' },
		{ src: race_car, shortname: ':race_car:', category: 'Travel' },
		{ src: red_car, shortname: ':red_car:', category: 'Travel' },
		{ src: taxi, shortname: ':taxi:', category: 'Travel' },
		{ src: tractor, shortname: ':tractor:', category: 'Travel' },
		{ src: trolleybus, shortname: ':trolleybus:', category: 'Travel' },
		{ src: truck, shortname: ':truck:', category: 'Travel' },
	];

	return useMemo(
		() => ({
			emojiListPNG,
		}),
		[emojiListPNG],
	);
}

export default useDataEmojiSvg;
