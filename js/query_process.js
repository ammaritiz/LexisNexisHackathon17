var needle = require('needle')

function onResponse(err,resp){
    dt = {}
    console.log(user_query ,resp.body.classification)
    if (resp.body.classification == "countQuery"){
        dt.intent = "count"
    }
    else{
        dt.intent = "data"
    }
    
    //console.log(dt)
    
    var value = [];
    if(dt.intent == "count"){
        //value = "case";
    }
    else{
        if(user_query.match(/who/i)){
            value.push('judgeName');
        }
        else if(user_query.match(/when/i)){
            value.push('decisiondate');
        }
        else if(user_query.match(/where/i)){
            value.push('court','court_type');
        }
    }
    
    
    dt.val = value
    dt.column = []
    dct = {}

    var words = ['real','property','education','healthcare','labor','employment','patent','criminal','energy ', 'utilities','bankruptcy','military','veterans','copyright','trademark','Civil','international', 'trade','insurance','family','transportation','civil','rights','international','communications', 'admiralty','securities','tax','environmental','commercial','evidence','banking','torts','estate', 'gift','trust','workers','compensation','ssdi','compliance','business','corporate','constitutional', 'antitrust','trade','maritime'];

    var getWhere = function(question){
        var que = question.split(" ");
        que.forEach(function(e) {
            if(words.indexOf(e.toLowerCase()) > -1){
                dct.category = e;
            }
        });
    }
    getWhere(user_query);
    /*
    if(user_query.match(/latest/i)){
        len = user_query.match(/[1-9]+/i);
        if (len){
            dct.decisiondate = len[0];
        }
        else{
            dct.decisiondate = 1;
        }
    }*/

    if( user_query.match(/judged by/i) || user_query.match(/judge by/i) ||  user_query.match(/judge/i)){
        arr = user_query.match(/judged by|judge by|judge/i)
        jud = user_query.substring(arr.index).match(/\w+\s+\w+/i);

        if(jud.length){
            dct.judgeName = user_query.substring(arr.index).match(/\w+\s+\w+/i)[0];
        }  
    }

    if(user_query.match(/opinion/i)){
        value.push('opinion_majority');
        console.log(value);
    }
    else if((user_query.match(/critic/i))||(user_query.match(/dissent/i))){
        value.push('opinion_dissent');
        console.log(value);
    }
    
    if(user_query.match(/[0-9]+/i)){
        len = user_query.match(/[1-9]+/i);
        if (len){
            dt.num_of_case = len[0];
        }
        else{
            dt.num_of_case = 1;
        }
    }

    dt.column.push(dct)
    console.log(dt)

}

var process_query = function(user_query)
{
    user_query = 'How many cases at Arkansas supreme court?';
    user_query = user_query.toLowerCase()
    needle.post("https://8rc0ymmdo5.execute-api.us-east-2.amazonaws.com/dev/auto-classifier/HackPack-intent-classifier", {"input_text": user_query}, {headers:{"x-api-key": "XV7Ijo8auq2IXAI7tZ08F5pGNUo6gAO92D5nN0v0","Content-Type": "application/json"},json:true}, onResponse);//function(err, resp){console.log(resp.body) } );
}

user_query = 'How many cases at Arkansas supreme court?';
process_query("");
