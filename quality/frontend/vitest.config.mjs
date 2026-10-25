import path from 'node:path';
import {fileURLToPath} from 'node:url';
const qualityDir=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(qualityDir,'../..'),root=path.join(project,'frontend');
export default {
 root,
 resolve:{dedupe:['react','react-dom','firebase','lucide-react','@testing-library/react']},
 server:{fs:{allow:[project]}},
 test:{environment:'jsdom',include:[path.relative(root,path.join(qualityDir,'test/**/*.test.{js,jsx}'))]}
};
