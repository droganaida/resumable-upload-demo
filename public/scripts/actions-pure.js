
function generateId(file){
    // generate id by asynchronously calling express endpoint
    return new Promise((resolve, reject) => {
        const xhr = reqAjax("/fileid?filename=" + encodeURI(file.name));
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject();
                }
            }
        };
    });
}

function reqAjax(url, method='GET', data='') {
    const xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open(method, url);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send(data);
    return xhr;
}

function hide(el) {
    el.style.display = 'none';
}

function show(el) {
    el.style.display = 'block';
}

const r = new Resumable({
    target: '/upload',
    chunkSize: 1*1024*1024,
    simultaneousUploads: 4,
    throttleProgressCallbacks: 1,
    generateUniqueIdentifier: generateId
});

// Controls
const resumableError = document.querySelector('.resumable-error');
const resumableDrop = document.querySelector('.resumable-drop');
const resumableBrowse = document.querySelector('.resumable-browse');
const resumableProgress = document.querySelector('.resumable-progress');
const resumableProgressResume = document.querySelector('.resumable-progress .progress-resume-link');
const resumableProgressPause = document.querySelector('.resumable-progress .progress-pause-link');
const resumableList = document.querySelector('.resumable-list');

// Resumable.js isn't supported, fall back on a different method
if(!r.support) {
    show(resumableError);
} else {
    // Show a place for dropping/selecting files
    show(resumableDrop);

    resumableDrop.addEventListener("dragenter", function() {
        this.classList.add('resumable-dragover');
    }, false);
    resumableDrop.addEventListener("dragend", function() {
        this.classList.remove('resumable-dragover');
    }, false);
    resumableDrop.addEventListener("drop", function() {
        this.classList.remove('resumable-dragover');
    }, false);

    r.assignDrop(resumableDrop);
    r.assignBrowse(resumableBrowse);

    // Array of file identifiers uploading at the moment
    let nowUploading = [];

    r.on('beforeCancel', function () {
        let data = new FormData();
        data.append('action', 'cancelUpload');
        data.append('nowUploading', nowUploading);
        reqAjax('/upload', 'POST', data);
    });

    // Handle file add event
    r.on('fileAdded', function(file){

        // Add file identifier to uploading files
        nowUploading.push(file.uniqueIdentifier);

        // Show progress pabr
        show(resumableProgress);
        show(resumableList);

        // Show pause, hide resume
        hide(resumableProgressResume);
        show(resumableProgressPause);

        // Add the file to the list
        resumableList.innerHTML += '<li class="resumable-file-'+file.uniqueIdentifier+'">Uploading <span class="resumable-file-name"></span> <span class="resumable-file-progress"></span>';
        document.querySelector('.resumable-file-'+file.uniqueIdentifier+' .resumable-file-name').innerHTML = file.fileName;

        // Actually start the upload
        r.upload();
    });
    r.on('pause', function(){
        // Show resume, hide pause
        show(resumableProgressResume);
        hide(resumableProgressPause);
    });
    r.on('complete', function(){
        // Hide pause/resume when the upload has completed
        hide(resumableProgressResume);
        hide(resumableProgressPause);
    });
    r.on('fileSuccess', function(file, message){

        // Remove file identifier from uploading files
        const index = nowUploading.indexOf(file.uniqueIdentifier);
        if (index !== -1) nowUploading.splice(index, 1);

        // Reflect that the file upload has completed
        const currentElement = document.querySelector('.resumable-file-'+file.uniqueIdentifier+' .resumable-file-progress');
        currentElement.innerHTML = '(completed)';
        currentElement.className += " ready";
        const linkElement = document.querySelector('.resumable-file-'+file.uniqueIdentifier+' .resumable-file-name');
        linkElement.innerHTML = `<a href="/statics/${linkElement.innerHTML}" target="_blank">${linkElement.innerHTML}</a>`;
    });
    r.on('fileError', function(file, message){
        // Reflect that the file upload has resulted in error
        document.querySelector('.resumable-file-'+file.uniqueIdentifier+' .resumable-file-progress').innerHTML =
            '(file could not be uploaded: '+message+')';
    });
    r.on('fileProgress', function(file){
        // Handle progress for both the file and the overall upload
        document.querySelector('.resumable-file-'+file.uniqueIdentifier+' .resumable-file-progress').innerHTML =
            Math.floor(file.progress()*100) + '%';
        document.querySelector('.progress-bar').style.cssText = 'width:' + Math.floor(r.progress()*100) + '%;';
    });
    r.on('cancel', function(){
        const fileProgresses = document.querySelectorAll('.resumable-file-progress');
        for (let i=0; i<fileProgresses.length; i++) {
            if (!fileProgresses[i].classList.contains('ready')){
                fileProgresses[i].innerHTML = '(canceled)';
            }
        }
    });
    r.on('uploadStart', function(){
        // Show pause, hide resume
        hide(resumableProgressResume);
        show(resumableProgressPause);
    });
}