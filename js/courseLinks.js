
if (url.match(/.+horizon.mcgill.ca\/pban1\/bzskmcer.p_display_form/) != null)
{
    console.log(top.name);
    courseEvalParams = JSON.parse(top.name);
    courseName = courseEvalParams.course;
    autoSubmit = courseEvalParams.autoSubmit;



    if (autoSubmit) {
        document.getElementById('subj_id').value="" + courseName.split("-")[0].toUpperCase();
        if (courseName.split("-")[1] != undefined) {
            document.getElementById('crse_id').value="" + courseName.split("-")[1];
        }
        courseEvalParams.autoSubmit = false;
        courseEvalParamsString = JSON.stringify(courseEvalParams);
        top.name = courseEvalParamsString;
        document.forms["search_form"].submit();
    }

}
else {
    top.name = "";

    url = window.location.href;

    urlYearF = parseInt(url.match(/.+(20[0-9][0-9])-.+/)[1]);
    urlYearW = urlYearF+1;
    urlYears = urlYearF + "-" + urlYearW;
    sysYear = new Date().getFullYear();
    isNewStyle = document.getElementsByClassName("transition").length > 0;

    //Course name regex
    regex = /([A-Z]{4})\s([0-9]{3}[A-Za-z]{0,1}[0-9]{0,1})/g;

    if (url.match(/.+study.+courses.+[-]+/) != null) {

        courseName = url.match(/courses\/([A-Za-z]{4}-[0-9]{3}[A-Za-z]{0,1}[0-9]{0,1})/)[1].toUpperCase();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Replace Course names with links to course overview page
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        newContentElement = document.getElementById(isNewStyle ? "content" : "content-area");
        newContent = newContentElement.innerHTML;
        newContent = newContent.replace(regex, "<a href=\"http://www.mcgill.ca/study/" + urlYears + "/courses/$1-$2\">$1 $2</a>");
        newContentElement.innerHTML = newContent;






        courseTerms = document.getElementsByClassName("catalog-terms")[0].innerHTML;
        courseTermsCodes = [];
        if (courseTerms.match(/Fall/) != null) {
            courseTermsCodes.push( {name: "Fall " + urlYearF,  code: urlYearF + "09"} );
        }
        if (courseTerms.match(/Winter/) != null) {
            courseTermsCodes.push( {name: "Winter " + urlYearW,  code: urlYearW + "01"} );
        }
        if (courseTerms.match(/Summer/) != null) {
            courseTermsCodes.push( {name: "Summer " + urlYearW,  code: urlYearW + "05"} );
        }
        //console.log(courseTermsCodes);

        var sidebar = document.createElement('div');
        sidebar.id = (isNewStyle ? "sidebar-column" : "right-sidebar");
        sidebar.style.border = "0px";
        sidebar.style.marginBottom = "10px";

        var courseEval = document.createElement('div');
        courseEval.style.margin = "10px 0px";
        sidebar.appendChild(courseEval);

        var courseEvalTitle = document.createElement('h4');
        courseEvalTitle.innerHTML = "View Mercury Evaluations";
        courseEval.appendChild(courseEvalTitle);

        courseEvalParams = {
            course: courseName,
            autoSubmit: true
        };
        courseEvalParamsString = JSON.stringify(courseEvalParams);

        var courseEvalForm = document.createElement('form');
        courseEvalForm.setAttribute("action", "https://horizon.mcgill.ca/pban1/bzskmcer.p_display_form");
        courseEvalForm.setAttribute("method", "POST");
        courseEvalForm.setAttribute("onsubmit", "top.name='" + courseEvalParamsString + "'");
        courseEval.appendChild(courseEvalForm);

        var courseEvalButton = document.createElement('input');
        courseEvalButton.setAttribute("type", "submit");
        courseEvalButton.setAttribute("value", courseName.replace("-", " ") + " Course Evaluations");
        courseEvalButton.style.width="100%";
        courseEvalButton.style.padding="7px";
        courseEvalButton.style.margin="2% 0%";
        courseEvalForm.appendChild(courseEvalButton);

        var courseReg = document.createElement('div');
        courseReg.style.margin = "10px 0px";
        sidebar.appendChild(courseReg);

        var courseRegTitle = document.createElement('h4');
        courseRegTitle.innerHTML = "View Minerva Registration";
        courseReg.appendChild(courseRegTitle);

        for (var i = 0; i < courseTermsCodes.length; i++) {

            var courseRegForm = document.createElement('form');
            courseRegForm.setAttribute("action", "https://horizon.mcgill.ca/pban1/bwckgens.p_proc_term_date");
            courseRegForm.setAttribute("method", "POST");
            courseRegForm.setAttribute("onsubmit", "return checkSubmit()");
            courseRegForm.innerHTML += "<input type=\"hidden\" name=\"p_calling_proc\" value=\"P_CrseSearch\">";
            courseRegForm.innerHTML += "<input type=\"hidden\" name=\"search_mode_in\" value=\"NON_NT\">";
            courseRegForm.innerHTML += "<input type=\"hidden\" name=\"p_term\" value=\"" + courseTermsCodes[i].code + "\">";
            courseReg.appendChild(courseRegForm);

            var courseRegButton = document.createElement('input');
            courseRegButton.setAttribute("type", "submit");
            courseRegButton.setAttribute("value", "Register " + courseTermsCodes[i].name);
            courseRegButton.style.width="100%";
            courseRegButton.style.padding="7px";
            courseRegButton.style.margin="2% 0%";
            courseRegForm.appendChild(courseRegButton);
        }

        var container = document.getElementById(isNewStyle ? "inner-container" : "container");
        if (document.getElementById(isNewStyle ? "sidebar-column" : "right-sidebar") != null) {
            container.insertBefore(sidebar, document.getElementById(isNewStyle ? "sidebar-column" : "right-sidebar"));
        }
        else {
            if (isNewStyle) {
                document.getElementById("inner-container").style.width = "100%";
                document.getElementById("main-column").style.width = "724px";
                container.appendChild(sidebar);
            }
            else {
                document.getElementById("center-column").style.width = "620px";
                container.insertBefore(sidebar, document.getElementById("footer"));
            }

        }




        //create array of departments mentioned
        urlDep = url.match(/.+([A-Za-z]{4})-[0-9]{3}/)[1].toUpperCase();
        courses = newContent.match(/[A-Z]{4}\s[0-9]{3}/g);
        depsDup = [urlDep];
        if (courses != null)
        {
            for (c=0; c<courses.length; c++)
            {
                depsDup.push(courses[c].match(/([A-Z]{4})\s[0-9]{3}/)[1]);
            }
        }
        var deps = depsDup.filter(function(elem, pos) {
            return depsDup.indexOf(elem) == pos;
        });


        var container = document.getElementById(isNewStyle ? "block-system-main" : "content-area").getElementsByClassName("content")[0];


        var relatedCourses = document.createElement('div');

        var relatedCoursesTitle = document.createElement('h3');
        relatedCoursesTitle.innerHTML = "Related Courses Links"
        relatedCourses.appendChild(relatedCoursesTitle);

        var relatedCoursesDesc = document.createElement('p');
        relatedCoursesDesc.innerHTML = "Here are links to related programs by department or professor name."
        relatedCourses.appendChild(relatedCoursesDesc);
        container.appendChild(relatedCourses);



        for (d = 0; d<deps.length; d++)
        {
            depCoursesURL = "https://www.mcgill.ca/study/" + urlYears + "/courses/search?" + (isNewStyle ? "f[0]=field_subject_code%3A" : "filters=ss_subject%3A") + deps[d];

            //var depCoursesLink = document.createElement('input');
            //depCoursesLink.setAttribute("type", "button");
            //depCoursesLink.setAttribute("value", "See all " + deps[d] + " courses offered for the " + urlYears + " academic year.");
            //depCoursesLink.setAttribute("self.location", depCoursesURL);
            //depCoursesLink.style.marginBottom = "10px";

            var depCoursesLink = document.createElement('a');
            depCoursesLink.innerHTML = (isNewStyle ? "<p>" : "")
                + (!isNewStyle && d>0 ? "<br>" : "")
                + "See all " + deps[d] + " courses offered for the " + urlYears + " academic year."
                + (isNewStyle ? "</p>" : "");
            depCoursesLink.style.marginBottom = "10px";
            depCoursesLink.setAttribute("href", depCoursesURL);

            relatedCourses.appendChild(depCoursesLink);
        }





    }
    else {
        //Replace Course names with links to course overview page
        cns = document.getElementsByClassName("program-course-description-inner");
        for (cn = 0; cn<cns.length; cn++)
        {
            newContent = document.getElementsByClassName("program-course-description-inner")[cn].innerHTML
            newContent = newContent.replace(/<li>(.+)<.li>/g, "<p>$1</p>");
            newContent = newContent.replace(regex, "<a href=\"http://www.mcgill.ca/study/" + urlYears + "/courses/$1-$2\">$1 $2</a>");
            document.getElementsByClassName("program-course-description-inner")[cn].innerHTML = newContent;
        }
    }





}


