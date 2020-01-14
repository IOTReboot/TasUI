const simpleGit = require('simple-git/promise');
const fs = require('fs')
const child_process = require('child_process')
const fsx = require('fs-extra')

const branchRepoMap = {
    "development": "tasuidev.shantur.com",
    "master": "tasui.shantur.com",
}

const publish_temp = '/tmp/tasui_publish_temp'

function getDiff(sourceGit) {

}

function publishBranch(sourceGit, diff, codeStatus, head) {

    // console.log(diff)

    // console.log(codeStatus)

    let dirty = codeStatus.conflicted.length > 0 || codeStatus.created.length > 0 
                || codeStatus.deleted.length > 0 || codeStatus.modified.length > 0 
                || codeStatus.renamed.length > 0

    console.log("Dirty : " + dirty )

    // console.log(head)

    let commitID = head.split(/\n/)[0].split(' ')[1]

    console.log("Commit ID " + commitID)

    let branch = codeStatus.current;
    console.log("Publishing branch : " + branch)


    try{
        fs.rmdirSync(publish_temp, {recursive: true})
    } catch (e) {
        if (e.code === 'ENOENT') {
            //Ignore if not present
        } else {
            console.log(e)
            throw e
        }
    }

    fs.mkdirSync(publish_temp, { recursive: true }, (err) => {
        if (err) throw err;
      });

    console.log(process.cwd())


    let commitMessage = `
    Publishing TasUI ${commitID}
    Branch :${branch}
    Commmit: ${commitID} https://github.com/IOTReboot/TasUI/tree/${commitID}
    Local Changes: ${dirty}


    ${dirty ? "Local Changes " + JSON.stringify(diff, null, 2) : ""}
    `
    
    let publishGit = require('simple-git/promise')(publish_temp)

    publishGit.checkIsRepo()
        .then(isRepo => !isRepo && clonePublishingRepo(publishGit, branch))
        .then(() => publishGit.checkout('master'))
        .then(() => child_process.execSync(`bash -c "rm -rf ${branch === "master" ? `${publish_temp}/*` : `${publish_temp}/${branch}/*`}"`))
        .then(() => child_process.execSync(`bash -c "echo ${branch === "master" ? branchRepoMap.master : branchRepoMap.development} > ${publish_temp}/CNAME"`))
        .then(() => fsx.copySync('./build', branch === "master" ? publish_temp : `${publish_temp}/${branch}`))
        .then(() => publishGit.add('-A'))
        .then(() => publishGit.commit(commitMessage))
        .then(() => publishGit.push('origin', 'master'))
}

function clonePublishingRepo(git, branch) {
    let repo = branch === "master" ? branchRepoMap.master : branchRepoMap.development
    console.log("Cloning repo "+ repo)
    return git.clone("git@github.com:IOTReboot/" + repo + ".git", publish_temp)
}

const sourceGit = simpleGit(process.cwd())
sourceGit.silent(true)
.diffSummary()
.then((diff) => 
    sourceGit.status()
        .then(status => sourceGit.show(["HEAD", "-q"])
        .then(head => publishBranch(sourceGit, diff, status, head))));

