/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import { Client } from '@elastic/elasticsearch';
import macros from './macros';

const Elastic = new Client({ node: 'http://localhost:9200' });

Elastic.resetIndex = async (indexName, mapping) => {
  // Clear out the index.
  await Elastic.indices.delete({ index: indexName }).catch(() => {});
  try {
    // Put in the new classes mapping (elasticsearch doesn't let you change mapping of existing index)
    await Elastic.indices.create({
      index: indexName,
      body: mapping,
    });
  } catch (error) {
    macros.error("Elasticsearch: couldn't reset index", error);
    throw new Error(error);
  }
};

export default Elastic;
