import pandas as pd
#from bs4 import BeautifulSoup
from xml.dom import minidom
import sys
import os
from os import listdir
from os.path import isfile, join

df_meta = pd.read_csv(os.getcwd() + "/../data/metadata.tsv", sep="\\t")
df_judges = pd.read_csv(os.getcwd() + "/../data/federal-judges.csv", encoding = 'ISO-8859-1')

mypath = os.getcwd() + '\\federal\\casemets\\'
onlyfiles = [join(mypath, f) for f in listdir(mypath) if isfile(join(mypath, f)) and f[-3:] == 'xml']
mypath = os.getcwd() + '\\arkansas\\'
onlyfiles += [join(mypath, f) for f in listdir(mypath) if isfile(join(mypath, f)) and f[-3:] == 'xml']

dct_data = dict()

for i in range(len(onlyfiles)):
    try:
        
        xmldoc = minidom.parse(onlyfiles[i])
        
        dct_data['caseid'] = dct_data.get('caseid',[])+[xmldoc.getElementsByTagName('case')[0].getAttribute('caseid')]
        
        dct_data['name']  = dct_data.get('name',[])+[xmldoc.getElementsByTagName('case')[0].getElementsByTagName('name')[0].childNodes[0].data]
        dct_data['docketnumber']  = dct_data.get('docketnumber',[])+[xmldoc.getElementsByTagName('case')[0].getElementsByTagName('docketnumber')[0].childNodes[0].data]
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
    except Exception as e:
        print("Exception: ",onlyfiles[i], sys.exc_info())

print(curr_data, dct_data)
