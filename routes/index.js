
var express = require('express');
var router = express.Router();

//Requires for spell-checker
var dictionary = require('dictionary-en-us');
var nspell = require('nspell');

/* GET home page. */
var watson = require('watson-developer-cloud');

var tone_analyzer = new watson.ToneAnalyzerV3({
    username: 'cdedd54c-683f-4e0a-848c-262a02f354e8',
    password: 'ypYZZkbvj6bc',
    version: 'v3',
    version_date: '2016-05-19 '
});

router.get('/', function(req, res, next) {

    res.render('editor', { text: "", emotionArray: [],languageArray: [], socialArray: []});

});


router.post('/', function(req, res, next) {
    var ratio = 0.0;
    var numWords = 0;
    var numMisspelled = 0;
    tone_analyzer.tone({ text: req.body.text },


        //console.log("There are " + misspelled + " misspelled words out of " + numWords + " words. Ratio: " + ratio);
        //res.render('editor', { misspelled: misspelled,ratio: ratio, numWords: numWords});

        function(err, tone) {

            dictionary(function (err, dict) {
                if (err) {
                    throw err;
                }

                var spell = nspell(dict);
                var email = req.body.text;
                var punctuationless = email.replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g,"");
                var finalString = punctuationless.replace(/\s{2,}/g," ");
                var words = finalString.split(" ");

                numWords = words.length;

                for(var letter=65;letter<91;letter++)
                {
                    var _char = String.fromCharCode(letter);
                    spell.remove(_char);
                }
                for(var letter=97;letter<=122;letter++)
                {
                    var _char = String.fromCharCode(letter);
                    spell.remove(_char);
                }

                spell.add('A');
                spell.add('a');
                spell.add('i');
                spell.add('I');
                console.log(words);

                words.forEach(function(obj) {
                    if(spell.correct(obj) == false) {
                        console.log(obj);
                        numMisspelled++;
                    }
                })
                ratio = numMisspelled/numWords;
            });

            if (err)
            console.log(err);
            else {
                console.log(JSON.stringify(tone, null, 2) + "\n\n\n");
                var object = tone["document_tone"]["tone_categories"][0]["tones"][0]["tone_name"]
                //console.log(JSON.stringify(object, null, 2));

                var emotionArray = [];
                var languageArray = [];
                var socialArray = [];

                var emotion = tone["document_tone"]["tone_categories"][0]["tones"]

                emotion.forEach(function(obj){
                    var newObj = {
                        name: obj["tone_name"],
                        value: obj["score"]*100
                    }
                    emotionArray.push(newObj);
                });

                var language = tone["document_tone"]["tone_categories"][1]["tones"]

                language.forEach(function(obj){
                    var newObj = {
                        name: obj["tone_name"],
                        value: obj["score"]*100
                    }
                    languageArray.push(newObj);
                });

                var social = tone["document_tone"]["tone_categories"][2]["tones"]

                social.forEach(function(obj){
                    var newObj = {
                        name: obj["tone_name"],
                        value: obj["score"]*100
                    }
                    socialArray.push(newObj);
                });

                emotionArray.forEach(function(obj){
                    console.log(obj.name +  " - " + obj.value);
                });
                languageArray.forEach(function(obj){
                    console.log(obj.name +  " - " + obj.value);
                });
                socialArray.forEach(function(obj){
                    console.log(obj.name +  " - " + obj.value);
                });
                res.render('editor', { text: req.body.text, emotionArray: emotionArray,languageArray: languageArray, socialArray: socialArray, numMisspelled: numMisspelled,ratio: ratio, numWords: numWords});
            }
        });

    });

    module.exports = router;
