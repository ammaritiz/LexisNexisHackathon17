var main = require("./main.js")
var Promise = require("bluebird");
var _ = require("underscore");
if (!process.env.BOT_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
var Botkit = require('botkit');
var os = require('os');

var controller = Botkit.slackbot({
  debug: false
});

var bot = controller.spawn({
  token: process.env.BOT_TOKEN
}).startRTM();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'pass123',
  database : 'sample'
});

var getData = function(){
    connection.connect();
    var query;
    connection.query('show tables;', function(err, rows, fields) {
      if (!err){
        //console.log('Data is: ');
        //console.log(JSON.stringify(rows));
        var data = rows;
        //var data = JSON.stringify(rows);
        //var data = JSON.parse(JSON.stringify(rows));
        console.log(data);
        for(var i=0;i<data.length;i++){
            
            //console.log(data[i].id);
            console.log(data[i].Tables_in_sample);
            bot.reply(message, data[i].Tables_in_sample);
        }
            
    }
    //else
        //bot.reply('Error while performing Query.'+err);
    });
    connection.end();
}
/**
 * Fulfilling Use Case 1
 * @param bot - our DeveloperTriage bot
 * @param message - command
 */
controller.hears(['table names'], 'direct_message, direct_mention, mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    connection.connect();
    
    connection.query('show tables;', function(err, rows, fields) {
      if (!err){
        //console.log('Data is: ');
        //console.log(JSON.stringify(rows));
        var data = rows;
        //var data = JSON.stringify(rows);
        //var data = JSON.parse(JSON.stringify(rows));
        console.log(data);
        for(var i=0;i<data.length;i++){
            
            //console.log(data[i].id);
            console.log(data[i].Tables_in_sample);
            bot.reply(message, data[i].Tables_in_sample);
        }
            
    }
    //else
        //bot.reply('Error while performing Query.'+err);
    });
    connection.end();
    });
  });

/**
 * UC1's different conversation patterns and flows
 * @param response - response of the user
 * @param convo - conversation between the user and the bot
 * @param name - the user that the user want to check the current deadlines for
 * @param message - command
 */
var getICBU = function(message, user, openIssues)
{
    main.getIssuesClosedByUser(user.gitName).then(function(result) {
      bot.startConversation(message, function(error, convo){
        main.sortAndCompareIssues(result, openIssues).then(function(matchingR) {
          var string;
          if(matchingR.length == 0){
            string = "No issues to work on for now!";
          } else {
            var titles = _.pluck(matchingR, "title");
            var urls = _.pluck(matchingR, "html_url");
            string = "*Here are some open issues:*\n";
            for(var i = 0; i < matchingR.length; i++){
              string += (i + 1) + ") "+ titles[i] + ": ";
              string += urls[i] + "\n\n";
            }
          }
          convo.ask(string + "Pick an item from the list!", [
            {
              pattern: "^[0-9]+$",
              callback: function(response, convo) {
                if(response.text > matchingR.length || response.text < 1 || isNaN(response.text)){
                  convo.say("Invalid issue number selected!");
                  convo.repeat();
                  convo.next();
                } else {
                  var issue = matchingR[response.text - 1].number;
                  main.assignIssueToUser(user, issue, user.gitName).then(function(resp){
                    convo.say(resp);
                    convo.next();
                  });
                }
              }
            },
            {
              pattern: "nevermind",
              callback: function(response, convo) {
                // stop the conversation. this will cause it to end with status == 'stopped'
                convo.say("Okay! No issue was selected!");
                console.log("okay");
                convo.next();
              }
            },
            {
              default: true,
              callback: function(response, convo) {
                convo.say("Invalid issue number selected!");
                convo.repeat();
                convo.next();
              }
            }]);
          }).catch(function (e){ // catch main.sortAndCompareIssues
            bot.reply(message, e);
          });
        }); // end bot.startConversation
      }); // end main.getIssuesClosedByUser
}

/**
 * Assign issue to user that doesn't have any work at that moment
 * @param response - response of the user
 * @param convo - conversation between the user and the bot
 * @param name - the user that the user want to check the current deadlines for
 * @param message - command
 */
var deadlineConversationAskingForIssueNumber = function(response, convo, results, name, message)
{
    convo.ask("What issue do you want to assign to "+name+" ?",function(response, convo) {
      main.assignIssueForDeadline(results,response.text,name).then(function(resp){
        bot.reply(message,resp);
        convo.next();
      }).catch(function (e){
        bot.reply(message,"Invalid response!");
        convo.repeat();
        convo.next();
      });
    });
  }

/**
 * Get deadlines that a specific user is assigned to
 * @param response - response of the user
 * @param convo - conversation between the user and the bot
 * @param name - the user that the user want to check the current deadlines for
 * @param message - command
 */
var deadlineConversationAskingForAssignment = function(response, convo, name, message)
{
    main.getOpenIssuesForDeadlines().then(function (results)
    {
      var result =[];
      for(i=0;i<results.length;i++){
        result.push(i+1+" ) "+results[i].title);
        result.push(results[i].html_url);
        result.push('\n');
      }
      convo.say("No Deadlines found for " + name);
      convo.ask("Do you want to assign them any of the open issues?", [
        {
          pattern: 'yes',
          callback: function(response, convo) {
            convo.say(result.join('\n'));
            deadlineConversationAskingForIssueNumber(response,convo, results,name,message);
            convo.next();
          }
        },
        {
          pattern: 'no',
          callback: function(response, convo) {
            // stop the conversation. this will cause it to end with status == 'stopped'
            convo.say("Okay! No issue was assigned to " + name);
            console.log("in deadlines");
            convo.next();
          }
        },
        {
          default: true,
          callback: function(response, convo) {
            convo.repeat();
            convo.next();
          }
        }
      ]);
    }).catch(function (e){
      //No Deadline found as well as no open issues
      bot.reply(message,"No Deadlines found!");
      convo.stop();
    });
}

controller.hears(['deadlines for (.*)', 'Deadlines for (.*)'], 'direct_message, direct_mention, mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {

      main.isValidUser(name).then(function (validUserName){
        main.getDeadlinesForUser(name).then(function (results)
        {
          bot.reply(message, results);
        }).catch(function (e){
          bot.startConversation(message, function(err,convo){
            deadlineConversationAskingForAssignment(err,convo,name,message);
          });
        });
      }).catch(function (e){
        bot.reply(message,"Sorry, " +name +" is not a valid user!");
      });
    });
  });


controller.hears(['closed issues by (.*)', 'Closed issues by (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
      main.getIssuesClosedByUser(name).then(function (results)
      {
        bot.reply(message, results);
      }).catch(function (e){
        bot.reply(message, e+name);
      });
    });
});

/**
 * Fulfilling Use Case 3
 * @param bot - our DeveloperTriage bot
 * @param message - command
 */
controller.hears(['Help me with issue #(.*)', 'help me with issue #(.*)'], 'direct_message,direct_mention,mention', function(bot, message)
{
    var number = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
      if (user && user.name && user.gitName) {
        main.getHelp(user.gitName, number).then(function (results)
        {
          bot.reply(message, results);
        }).catch(function (e){
          bot.reply(message, e);
        });
      } else {
        bot.startConversation(message, function(err, convo) {
          if (!err) {
            if(!user || !user.name)
            asking_name(err,convo,message);
            else{
              bot.reply(message, 'Hello ' + user.name );
              asking_git_hub_name(err,convo,message);
            }
            // store the results in a field called nickname
            convo.on('end', function(convo) {
              if (convo.status != 'completed') {
                bot.reply(message, 'OK, nevermind!');
              }
            });
          }
        });
      }
    });
});

/**
 * Initializing the bot and
 * set up username and git username for the current user
 * @param bot - our DeveloperTriage bot
 * @param message - command
 */
controller.hears(['table data'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {

      if (user && user.name && user.gitName) {
        bot.reply(message, 'Hello ' + user.name );
      } else {
        bot.startConversation(message, function(err, convo) {
          if (!err) {
            if(!user || !user.name)
            asking_name(err,convo,message);
            else{
              bot.reply(message, 'Hello ' + user.name );
              asking_git_hub_name(err,convo,message);
            }
            // store the results in a field called nickname
            convo.on('end', function(convo) {
              if (convo.status != 'completed') {
                bot.reply(message, 'OK, nevermind!');
              }
            });
          }
        });
      }
    });

});

/**
 * Helper method for initializing of the bot
 * set up username for the current user
 * @param bot - our DeveloperTriage bot
 * @param message - command
 */

// var sampleJson = [{ 'intent':'count','column':[{'judgeName':'Robbins'}]}];
//var sampleJson = [{ 'intent':'count','column':[{'category':'Criminal'}]}];
// var sampleJson = [{ 'intent':'data','val':['judgeName','name'], 'column':[{'judgeName':'Robbins','caseID':'12345'}]}];
//var sampleJson = [{ 'intent':'data','val':['judgeName','name'], 'column':[{'judgeName':'Robbins','category':'Property'}]}];
var sampleJson = [{ 'intent':'data','val':['judgeName','name','category','opinion_majority'], 'column':[{'judgeName':'Robbins','category':'riminal'}]}];

var getQuery = function(sampleJson){
    var keySet = Object.keys(sampleJson[0]);
    //console.log(keySet);
    var query = '';
    //for(var k=0;k<keySet.length;k++){
    //keySet.forEach(function(k){
        //console.log("key ",k);
        if(keySet.indexOf('intent')>-1){
          console.log(sampleJson[0].intent);
            if(sampleJson[0].intent=='count'){
              console.log("inside count");
                query+='select count(*) as numOfRows from caseData';
            }
            else if(sampleJson[0].intent=='data'){
                if(keySet.indexOf('val')>-1){
                  query+='select ';
                    sampleJson[0].val.forEach(function(i){
                        query+=i+', ';
                    });
                    query = query.substring(0, query.length - 2);
		    query+=' from caseData';
                    //console.log("val: " + val);
                }
                else
                    query+='select * from caseData';
            }
        }
        if(keySet.indexOf('column')>-1){
            var col = sampleJson[0].column;
            console.log(col);
            var colkey = Object.keys(col[0]);
            if(colkey.length>0){
              query+=" where ";
              colkey.forEach(function(k){
                console.log(k, col[0][k]);  
                query+=k+" like '%"+col[0][k]+"%' and ";
              });
              query = query.substring(0, query.length - 5);
            }	

            //}
        }
    //});
    return query;
}

var asking_name = function(response, convo, message) {
    convo.say('Sampleuser Table Content:');
    connection.connect();
    console.log(JSON.stringify(sampleJson));
    var sample = JSON.stringify(sampleJson);
    var query = getQuery(sampleJson);
    console.log("query: ", query);
    connection.query(query, function(err, rows, fields) {
      if (!err){
        //console.log('Data is: ');
        //console.log(JSON.stringify(rows));
        var data = rows;
        //var data = JSON.stringify(rows);
        //var data = JSON.parse(JSON.stringify(rows));
        var keys;
        if(data.length>0){
            console.log(Object.keys(data[0]));
            keys = Object.keys(data[0]);
        }
 
        for(var i=0;i<data.length;i++){
            keys.forEach(function(k){
                console.log("key", k);
                console.log(data[i]);
		        convo.say(data[i][k]);
            });             
            //console.log(data[i].id);
            //console.log(data[i].username);
        }
            
    }
      else
        console.log('Error while performing Query.'+err);
    });
    
    connection.end();
    // convo.ask('What should I call you?', function(response, convo) {
    //   convo.ask('You want me to call you `' + response.text + '`?', [
    //     {
    //       pattern: 'yes',
    //       callback: function(response, convo) {
    //         // since no further messages are queued after this,
    //         // the conversation will end naturally with status == 'completed'
    //         controller.storage.users.get(message.user, function(err, user) {
    //           if (!user) {
    //             user = {
    //               id: message.user,
    //               gitName : '',
    //             };
    //           }
    //           user.name = convo.extractResponse('nickname');
    //           controller.storage.users.save(user, function(err, id) {
    //             bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
    //           });
    //         });
    //         asking_git_hub_name(response,convo, message);
    //         convo.next();
    //       }
    //     },
    //     {
    //       pattern: 'no',
    //       callback: function(response, convo) {
    //         // stop the conversation. this will cause it to end with status == 'stopped'
    //         convo.stop();
    //       }
    //     },
    //     {
    //       default: true,
    //       callback: function(response, convo) {
    //         convo.repeat();
    //         convo.next();
    //       }
    //     }
    //   ]);
    //   convo.next();
    // }, {'key': 'nickname'});
};

/**
 * Helper method for initializing of the bot
 * set up git username for the current user
 * @param bot - our DeveloperTriage bot
 * @param message - command
 */
// var asking_git_hub_name = function(response, convo, message) {

//   convo.ask('What is your github username?', function(response, convo) {
//       main.isValidUser(response.text).then(function (validUserName){
//         convo.ask('Your github user name is `' + response.text + '`? Please confirm', [
//           {
//             pattern: 'yes',
//             callback: function(response, convo) {
//               // since no further messages are queued after this,
//               // the conversation will end naturally with status == 'completed'
//               controller.storage.users.get(message.user, function(err, user) {
//                 user.gitName = convo.extractResponse('git_nickname');
//                 controller.storage.users.save(user, function(err, id) {
//                   bot.reply(message, 'Got it! updating you github user name as ' + user.gitName + ' from now on. You can now issue commands!');
//                 });
//               });
//               convo.next();
//             }
//           },
//           {
//             pattern: 'no',
//             callback: function(response, convo) {
//               // stop the conversation. this will cause it to end with status == 'stopped'
//               convo.stop();
//             }
//           },
//           {
//             default: true,
//             callback: function(response, convo) {
//               convo.repeat();
//               convo.next();
//             }
//           }
//         ]);
//     convo.next();
//       }).catch(function (e){
//         bot.reply(message,"Sorry, " +e +" is not a valid user!");
//         convo.repeat();
//         convo.next();
//       });
    
//     }, {'key': 'git_nickname'});
// };


/**
 * Responses to invalid commands
 * @param bot - our DeveloperTriage bot
 * @param message - command
 */
// controller.hears(['.*'], 'direct_message, direct_mention, mention', function(bot, message) {
//     controller.storage.users.get(message.user, function(err, user) {
//       if (user && user.name) {
//         bot.reply(message,"Sorry couldn't understand it "+ user.name );
//       }else{
//         bot.reply(message,"Sorry couldn't understand it ");
//       }
//       bot.reply(message,"Below are is the list of commands you can use:");
//       bot.reply(message,"1. Deadlines for <git_user_name>");
//       bot.reply(message,"2. Help me with issue #<github issue number>");
//       bot.reply(message,"3. Give me issues");
//     });
// });

// var sampleResponse = [{'count': 25}];
var sampleResponse = [{'judgeName': 'Ammar', 'name': 'KW', 'category': 'criminal law', 'opinion_majority':'yes'}, {'judgeName': 'Shrikant', 'name': 'KS','category': 'criminal law', 'opinion_majority':'yes'}];
// var sampleJson = [{ 'intent':'count','column':[{'judgeName':'Robbins'}]}];

controller.hears(['.*'], 'direct_message, direct_mention, mention', function(bot, message) {
    console.log("in main");
  user_query = message
  var process_query = function(user_query)
  {
      user_query = 'How many cases at Arkansas supreme court?';
      user_query = user_query.toLowerCase()
      needle.post("https://8rc0ymmdo5.execute-api.us-east-2.amazonaws.com/dev/auto-classifier/HackPack-intent-classifier", {"input_text": user_query}, {headers:{"x-api-key": "XV7Ijo8auq2IXAI7tZ08F5pGNUo6gAO92D5nN0v0","Content-Type": "application/json"},json:true}, 
      function(err,resp){
          dt = {}
          console.log(user_query ,resp.body.classification)
          if (resp.body.classification == "countQuery"){
              dt.intent = "count"
          }
          else{
              dt.intent = "data"
          }
          
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
          //console.log(dt)
          connection.connect();
          //var sample = JSON.stringify(dt);
          var query = getQuery(dt);
          //console.log("query: ", query);
          connection.query(query, function(err, rows, fields) {
            if (!err){
              if(dt[0]['intent'] == 'count')
              {
                bot.reply(message, "I found " + rows[0]['numOfRow'] + " cases")
              }
              else if(dt[0]['intent'] == 'data')
              {
                resp = "Ok, I found " + rows.length + " records. Here are the details for the same:\n\n";
                for(var i = 0; i < rows.length; i++){
                  dt[0]['val'].forEach(function(k){
                    resp += k + ': ' + rows[i][k] + '\n';
                  });
                  resp += '\n'
                }
                bot.reply(message, resp)
              }
          }
            else
              console.log('Error while performing Query.'+err);
          });
          
          connection.end();
      }
    );
  }

  
});