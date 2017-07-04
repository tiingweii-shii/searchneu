import elasticlunr from 'elasticlunr';
import path from 'path';
import mkdirp from 'mkdirp-promise';
import fs from 'fs-promise';
import _ from 'lodash';

import pageDataMgr from './pageDataMgr';
import macros from '../../macros';
import Keys from '../../../common/Keys';

// This is the main entry point for scraping classes
// call the main(['neu']) function below to scrape a college
// This file also generates the search index and data dumps. 

// TODO: figure out how to have acronym skip the search pipeline.
// The pipeline strips different endings of different words
// eg, it treats [fcs] the same as [fc].
// Which might not always be the same. 


const getSearchIndex = '/getSearchIndex';

class Main {


  async createDataDumps(termDump) {
    const termMapDump = {};


    for (const aClass of termDump.classes) {
      const hash = Keys.create(aClass).getHash();

      const termHash = Keys.create({
        host: aClass.host,
        termId: aClass.termId,
      }).getHash();

      if (!termMapDump[termHash]) {
        termMapDump[termHash] = {
          classMap: {},
          sectionMap: {},
          subjectMap: {},
          termId: aClass.termId,
          host: aClass.host,
        };
      }

      termMapDump[termHash].classMap[hash] = aClass;
    }

    for (const subject of termDump.subjects) {
      if (!subject.subject) {
        macros.error('Subject controller found in main.js????', subject);
        continue;
      }
      const hash = Keys.create(subject).getHash();

      const termHash = Keys.create({
        host: subject.host,
        termId: subject.termId,
      }).getHash();

      if (!termMapDump[termHash]) {
        console.log('Found subject with no class?');
        termMapDump[termHash] = {
          classMap: {},
          sectionMap: {},
          subjectMap: {},
          termId: subject.termId,
          host: subject.host,
        };
      }

      termMapDump[termHash].subjectMap[hash] = subject;
    }

    for (const section of termDump.sections) {
      const hash = Keys.create(section).getHash();

      const termHash = Keys.create({
        host: section.host,
        termId: section.termId,
      }).getHash();

      if (!termMapDump[termHash]) {
        console.log('Found section with no class?', termHash, hash);
        termMapDump[termHash] = {
          classMap: {},
          sectionMap: {},
          subjectMap: {},
          termId: section.termId,
          host: section.host,
        };
      }

      termMapDump[termHash].sectionMap[hash] = section;
    }

    const promises = [];

    for (const termHash in termMapDump) {
      const value = termMapDump[termHash];

      // Put them in a different file.
      if (!value.host || !value.termId) {
        macros.error('No host or Id?', value);
      }

      const folderPath = path.join(macros.PUBLIC_DIR, 'getTermDump', value.host);
      promises.push(mkdirp(folderPath).then(() => {
        return fs.writeFile(path.join(folderPath, `${value.termId}.json`), JSON.stringify(value));
      }));
    }
    return Promise.all(promises);
  }

  // Class Lists object is specific to this file, and is created below.
  async createSearchIndexFromClassLists(termData, outputExtention = '', includeDesc = true) {
    const keys = Keys.create(termData);

    // One possibility for this is to create a custom elastic search index. 
    // By default, the input fields are ran though three pipeline functions. 
    // The custom pipeline uses a custom implementation of the trimmer function. 
    // By default, the trimmer function removes symbols from the beginning and end of all tokens
    // A token is a word that is added to the search index (eg, each word in a class description, etc).
    // This was indexing the class [C++] as [C], which made it a lot less likely that the C++ class would appear if you typed in C++.
    // The custom function would have an exception for C++ (if (token.trim().toLowerCase() === 'c++') {) and then not remove the +'s.

    const index = elasticlunr();

    index.saveDocument(false);

    index.setRef('key');

    // Description is not included on mobile because it is not *really* required, and removing it makes loading on mobile faster.
    if (includeDesc) {
      index.addField('desc');
    }
    index.addField('name');
    index.addField('acronym');
    index.addField('classId');
    index.addField('subject');

    // Remove profs from here once this data is joined with the prof data and there are UI elements for showing which classes a prof teaches.
    index.addField('profs');

    // Lets disable this until buildings are added to the index and the DB.
    // Dosen't make sense for classes in a building to come up when the building name is typed in the search box.
    // If this is ever enabled again, make sure to add it to the config in home.js too.
    // index.addField('locations');
    index.addField('crns');

    for (const attrName2 in termData.classHash) {
      const searchResultData = termData.classHash[attrName2];

      const toIndex = {
        classId: searchResultData.class.classId,
        desc: searchResultData.class.desc.replace(/^\W+/, '').replace(/\W+$/, ''),
        subject: searchResultData.class.subject,
        name: searchResultData.class.name,
        key: Keys.create(searchResultData.class).getHash(),
      };

      let profs = [];
      // let locations = [];
      searchResultData.sections.forEach((section) => {
        if (section.meetings) {
          section.meetings.forEach((meeting) => {
            if (meeting.profs) {
              profs = profs.concat(meeting.profs);
            }

            // if (meeting.where) {
            //   locations.push(meeting.where);
            // }
          });
        }
      });

      // Don't index TBA and only index each professor's name once. 
      _.pull(profs, 'TBA');
      _.uniq(profs);


      // Remove middle names that are 0 or 1 characters long (not including symbols).
      for (var i = 0; i < profs.length; i++) {
        profs[i] = macros.stripMiddleName(profs[i], true)
      }


      toIndex.profs = profs.join(' ');
      // toIndex.locations = locations.join(' ');
      if (searchResultData.class.crns) {
        toIndex.crns = searchResultData.class.crns.join(' ');
      }

      // Generate the acronym for this class based on the name.
      // Remove any stop words from the acronym. 

      let name = searchResultData.class.name.replace('-', ' ')

      let splitName = name.split(' ');

      // Trim symbols from the beginning and the end.
      splitName = splitName.map(elasticlunr.trimmer);

      // Only keep words that are not numeric.
      // The other ways of making a acronym were to remove all the stop words and then take the first letter of the remaining words. 
      // But this (just keeping the first letter of each capilized word) worked just as well. (Only 44 classes were different for 4 different semesters).
      // If we do end up switching back to stop words, the list here http://xpo6.com/list-of-english-stop-words
      // worked a lot better than the list shipped with elasticlunr. 
      // Also need to remove word == 'hon' if using stop words (or add 'hon' to the stop word list). 
      // Would be interesting to see how well this works at other schools. 
      splitName = splitName.filter(function(word) {
        if (word.length === 0) {
          return false;
        }
        else if (macros.isNumeric(word)) {
          return false;
        }
        else if (word[0] !== word[0].toUpperCase()) {
          return false;
        }
        else {
          return true;
        }
      })

      splitName = splitName.map(function(word) {
        return word[0]
      })

      // NOTE: The generated acronym is ran through the elasticlunr pipeline which might modify it a bit (eg, remove S's from the end). 
      if (splitName.length > 1) {
        toIndex.acronym = splitName.join('')
      }
      else {
        toIndex.acronym = ''
      }


      index.addDoc(toIndex);
    }

    const searchIndexString = JSON.stringify(index.toJSON());

    const fileName = path.join(macros.PUBLIC_DIR, `${keys.getHashWithEndpoint(getSearchIndex) + outputExtention}.json`);
    const folderName = path.dirname(fileName);

    await mkdirp(folderName);
    await fs.writeFile(fileName, searchIndexString);
    console.log('Successfully saved', fileName);
  }


  async createSerchIndex(termDump) {
    let errorCount = 0;

    const classLists = {};

    termDump.classes.forEach((aClass) => {
      const termHash = Keys.create({
        host: aClass.host,
        termId: aClass.termId,
      }).getHash();

      const classHash = Keys.create(aClass).getHash();

      if (!classLists[termHash]) {
        classLists[termHash] = {
          classHash: {},
          host: aClass.host,
          termId: aClass.termId,
        };
      }

      classLists[termHash].classHash[classHash] = {
        class: aClass,
        sections: [],
      };
    });


    termDump.sections.forEach((section) => {
      const termHash = Keys.create({
        host: section.host,
        termId: section.termId,
      }).getHash();

      const classHash = Keys.create({
        host: section.host,
        termId: section.termId,
        subject: section.subject,
        classUid: section.classUid,
      }).getHash();


      if (!classLists[termHash]) {
        // The objects should all have been created when looping over the classes.
        macros.error('Dont have obj in section for loop?', termHash, classHash, section);
        errorCount++;
        return;
      }

      if (!classLists[termHash].classHash[classHash]) {
        // Only error on CI if error occurs in the term that is shown.
        // TODO change to if this section occured in the past macros.log, if it is in the future, macros.error.
        if (section.host === 'neu.edu' && section.termId === '201810') {
          macros.error('No class exists with same data?', classHash, section.url);
        } else {
          macros.log('No class exists with same data?', classHash, section.url);
        }
        errorCount++;
        return;
      }

      classLists[termHash].classHash[classHash].sections.push(section);
    });

    // Sort each classes section by crn.
    // This will keep the sections the same between different scrapings.
    const termHashes = Object.keys(classLists);
    for (const termHash of termHashes) {
      const classHashes = Object.keys(classLists[termHash].classHash);
      for (const classHash of classHashes) {
        if (classLists[termHash].classHash[classHash].sections.length > 1) {
          classLists[termHash].classHash[classHash].sections.sort((a, b) => {
            return a.crn > b.crn;
          });
        }
      }
    }


    const promises = [];

    for (const attrName in classLists) {
      const termData = classLists[attrName];
      promises.push(this.createSearchIndexFromClassLists(termData));
    }

    console.log('Errorcount: ', errorCount);


    return Promise.all(promises);
  }

  // CollegeAbbrs are the hostname but without the ".edu" at the end
  async getTermDump(collegeAbbrs) {
    const outputFile = path.join(macros.DEV_DATA_DIR, `classes${collegeAbbrs.join(',')}.json`);

    // if this is dev and this data is already scraped, just return the data
    if (macros.DEV && require.main !== module) {
      const devData = await macros.loadDevData(outputFile);
      if (devData) {
        return devData;
      }
    }

    const termDump = await pageDataMgr.main(collegeAbbrs);

    if (macros.DEV) {
      await macros.saveDevData(outputFile, termDump);
      console.log('classes file saved for', collegeAbbrs, '!');
    }
    return termDump;
  }


  async main(collegeAbbrs) {
    if (!collegeAbbrs) {
      console.error('Need collegeAbbrs for scraping classes');
      return;
    }


    const termDump = await this.getTermDump(collegeAbbrs);

    await this.createSerchIndex(termDump);
    await this.createDataDumps(termDump);
  }
}

const instance = new Main();

if (require.main === module) {
  instance.main(['neu']);
}

export default instance;