var question = "how many cases that discuss estate and gift";
var words = ['real','property','education','healthcare','labor','employment','patent','criminal','energy ', 'utilities','bankruptcy','military','veterans','copyright','trademark','Civil','international', 'trade','insurance','family','transportation','civil','rights','international','communications', 'admiralty','securities','tax','environmental','commercial','evidence','banking','torts','estate', 'gift','trust','workers','compensation','ssdi','compliance','business','corporate','constitutional', 'antitrust','trade','maritime'];
var where = {};
var getWhere = function(question){
    var que = question.split(" ");
    //console.log(que);
    //console.log(words);
    que.forEach(function(e) {
        //console.log(words.indexOf('real'));

        if(words.indexOf(e.toLowerCase()) > -1){
            where.category = e;
        }
            
    });
}

getWhere(question);
console.log(where);