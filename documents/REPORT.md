#REPORT MILESTONE

This report contains a description of the problem the bot solves. It also mentions its primary features and talks about some limitations and future work. 

##The problem our bot solved:

Assigning bugs to developers is a time consuming task which wastes precious and expensive developer hours. The ability to assign and suggest similar and suitable issues along with the ability to recommend experienced developer for help to user is an essential core of our bot. 


##Primary features and screenshots:

- Fetch open issues that are matched to the developer based on experience of working with similar issues in the past.

 <img src="../images/givemeissues.png"/>
 
- Get a developer’s deadlines when assigning issues based on milestones and assign issues to developers that have no issues to work on. 

 <img src="../images/deadlinesFor_useCase2.png"/>

- Recommend experienced developers that can help with the issue you are working on.

 <img src="../images/helpIssues_useCase3.png"/>

##Development process and project:

It was a nice learning experience but one thing we lagged in was knowledge about tools and technologies that we were going 
to use in the project. It would have been better if we knew about other alternatives and then decide which is best suite. 
The development process was agile, as we had to constantly change the requirements of our bot to solve the problem of task 
allocation. The team was flexible and ready to switch gears and change the approach of how the bot should process the 
commands and handle edge cases. In every team meeting we would look at the current state of the bot and create a list of 
known bugs and new features that are to be added. We would then prioritize a fix a deadline for a portion of the high 
priority tasks and then repeat the whole process again.

##Any limitations and future work:

- One limitation is the inability to associate two issues if they have different names, labels and description. 
- Issue matching algorithm can be improved by using concepts of machine learning so the results are more accurate.
- Factoring in some form of timesheet/calendar would be useful to know which developers are not assigned to any issue and will have free time in near future.
- The bot could be more user friendly and seamless, for example improving the oboarding experience of entering the developer's name and github username to interact with the bot; in the future, we can map github names with actual names automatically. 
- Currently, there is no way to reset or change the github username, this could be easily added for future iterations.
