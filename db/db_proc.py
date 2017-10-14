import pandas as pd
#from bs4 import BeautifulSoup
from xml.dom import minidom
import sys
import os
from os import listdir
from os.path import isfile, join
import pymysql

db = pymysql.connect(host="localhost",user="root",passwd="pass123",db="featureData")
cur = db.cursor()
df_meta = pd.read_csv(os.getcwd() + "/data/metadata.tsv", sep="\\t")
df_judges = pd.read_csv(os.getcwd() + "/data/federal-judges.csv", encoding = 'ISO-8859-1')

mypath = os.getcwd() + '/data/federal/casemets/'
onlyfiles = [join(mypath, f) for f in listdir(mypath) if isfile(join(mypath, f)) and f[-3:] == 'xml']
mypath = os.getcwd() + '/data/arkansas/'
onlyfiles += [join(mypath, f) for f in listdir(mypath) if isfile(join(mypath, f)) and f[-3:] == 'xml']

dct_data = dict()

for i in range(len(onlyfiles)):
    try:
        
        xmldoc = minidom.parse(onlyfiles[i])
        
        dct_data['caseid'] = dct_data.get('caseid',[])+[xmldoc.getElementsByTagName('case')[0].getAttribute('caseid')]
        dct_data['name']  = dct_data.get('name',[])+[xmldoc.getElementsByTagName('case')[0].getElementsByTagName('name')[0].childNodes[0].data]
        #dct_data['docketnumber']  = dct_data.get('docketnumber',[])+[xmldoc.getElementsByTagName('case')[0].getElementsByTagName('docketnumber')[0].childNodes[0].data]
        dct_data['decisiondate']  = dct_data.get('decisiondate',[])+[xmldoc.getElementsByTagName('case')[0].getElementsByTagName('decisiondate')[0].childNodes[0].data]
        
        dct_data['opinion_majority'] = dct_data.get('opinion_majority',[])+['']
        dct_data['opinion_dissent'] = dct_data.get('opinion_dissent',[])+['']
        dct_data['opinion_other'] = dct_data.get('opinion_other',[])+['']
        dct_data['judge_name'] = dct_data.get('judge_name',[])+['']
        
        try:
            for op in xmldoc.getElementsByTagName('opinion'):
                key = 'opinion_other'
                if op.getAttribute('type') == 'majority':
                    key = 'opinion_majority'
                    if len(op.getElementsByTagName('author')) > 0:
                        dct_data['judge_name'][-1] = op.getElementsByTagName('author')[0].childNodes[0].data
                    
                elif op.getAttribute('type') == 'dissent':
                    key = 'opinion_dissent'
                else:
                    key = 'opinion_other'
                txt = ""
                for st in op.getElementsByTagName('p'):
                    txt += st.childNodes[0].data
                for st in op.getElementsByTagName('blockquote'):
                    txt += st.childNodes[0].data
                dct_data[key][-1] = txt
        except:
            print("Exception in opinion: ",onlyfiles[i], sys.exc_info())

        cur.execute(u'INSERT INTO caseData VALUES (%s,%s,%s,%s,%s,%s,%s)',(dct_data['caseid'][i],dct_data['name'][i],dct_data['decisiondate'][i],dct_data['opinion_majority'][i].encode('cp1252'),dct_data['opinion_dissent'][i].encode('cp1252'),dct_data['opinion_other'][i].encode('cp1252'),dct_data['judge_name'][i]))
        db.commit()
    except Exception as e:
        print("Exception: ",onlyfiles[i], sys.exc_info())
db.commit()
#values = [list() for item in dct_data['caseid']]
#print(len(dct_data['caseid'])
#cur.executemany(u'INSERT INTO caseData(caseID) VALUES (%s)',dct_data['caseid'])
#db.commit()
#print(curr_data, dct_data)
