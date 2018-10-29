(function($) {

    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // isMobile = !isMobile;

    let form = $('#customizedform');
    let index = 0;
    let sub_index = 0;
    let total_index = 0;
    let cnt_element = 0;
    let $active_element = null;
    let $variables = [];
    let timers = [];
    let child_clicked = false;
    let skip_to_id_list = [];
    let elements_with_variable = []; // save elemetns that has variable in title
    var signaturePad;
    let cnt_multiple_response = {};
    let enable_multiple_responses = false;
    let block_group_id; // block group id
    let blockgroup_elements_id = {}; // save first element of block group
    let blockgroup_firstindex = {}; // save first element's index of block group
    let cnt_block_group = 0;
    let submit_form_id;

    var OK_BUTTON_DESCRIPTION = "RETURN";
    // check OS
    if (navigator.appVersion.indexOf("Win")!=-1) OK_BUTTON_DESCRIPTION="ENTER";
    else if (navigator.appVersion.indexOf("Mac")!=-1) OK_BUTTON_DESCRIPTION="RETURN";
    else if (navigator.appVersion.indexOf("X11")!=-1) OK_BUTTON_DESCRIPTION="RETURN";
    else if (navigator.appVersion.indexOf("Linux")!=-1) OK_BUTTON_DESCRIPTION="RETURN";

    // input event
    let inputEvent = function() {
        let $this = $(this);
        if ($this.attr('name') == 'edit') {
            let is_valid = ($this.val()==''?false:true);

            var $ok_button = $this.next();
            $ok_button.toggleClass("hidden", !is_valid);
            
            $myRadio = $this.parent();
            $mainRadio = $myRadio.prev();

            let $input_radio = $mainRadio.find('input[type="radio"]');
            $input_radio.attr('value', is_valid?$this.val():'other');

            let $question_text = $mainRadio.find('.choice_question');
            $question_text.text(is_valid ? $this.val() : 'Other');
            // change icon to 'check' from 'edit'
            $main_span = $mainRadio.find('.choice_check');
            if ($input_radio.attr('checked'))
                $main_span.html('<i class="fas fa-edit">');
            $input_radio.attr('checked', false);

            return;
        } 
        console.log($this.val());
        let $radio = $this.closest('.question');
        let has_validation = $radio.data('validation');
        let is_required = $radio.data('required');
        let required_result = $radio.data('required_result');
        let validation_result = $radio.data('validation_result');
        let input_index = $this.data('index');
        console.log('~~~~~~~~~~~~~~~~~~~');
        console.log($radio);
        console.log(required_result);
        console.log(validation_result);
        console.log(input_index);
        console.log('~~~~~~~~~~~~~~~~~~~');

        let regex = /^[A-Za-z0-9]+/;
        if (has_validation) {
            regex =  $radio.data('validation_regex')[input_index];
        }
        console.log(regex);
        let is_valid=regex.test($this.val());
        console.log(is_valid + ": " + $this.val());
        //let is_valid=($this.val()==''?false:true);
        let not_empty=($this.val()==''?false:true);

        let $required_error = $radio.find('.required_error');
        let $regex_error = $required_error.next();
        let ok_button = $radio.find('.pressEnter');
        $regex_error.addClass('hidden');

        let is_ignore = $this.data('ignore');
        if (is_ignore === undefined) {
            is_ignore = false;
        }

        let flag = false;
        if (!not_empty && is_required && !is_ignore) {
            $required_error.removeClass('hidden');
            required_result[input_index] = false;
            $radio.data('required_result', required_result);
        } else {
            if (!is_ignore) {
                required_result[input_index] = true;
                $radio.data('required_result', required_result);
            }
            $required_error.addClass('hidden');
            flag = true;

            if (has_validation && !is_valid && !is_ignore) {
                validation_result[input_index] = false;
                $radio.data('validation_result', validation_result);
            } else {
                if (has_validation) {
                    validation_result[input_index] = true;
                    $radio.data('validation_result', validation_result);
                }
            }
        }
        if (is_required) {
            console.log('~@~@~@~@~@~@~@~');
            console.log(required_result);
            console.log('~@~@~@~@~@~@~@~');
            if (checkArrayValues(required_result)) {
                $required_error.addClass('hidden');
            } else {
                $required_error.removeClass('hidden');
            }
        }
        let variables = $radio.data('variables');
        if (variables !== undefined) {
            for (let index = 0 ; index < variables.length ; index++) {
                let variable = variables[index];
                let var_index = $variables.findIndex(x => x.name == variable.name);
                if (var_index != -1) {
                    let var_value = '';
                    let value_valid = false;
                    if (include_key(variable, 'entire_input')) {
                        var_value = $this.val();
                        value_valid = true;
                    }
                    else if (include_key(variable, 'regex_match')) {
                        let matches = regex.exec($this.val());
                        if (matches !== null) {
                            var_value = matches[variable.regex_match-1];
                            value_valid = true;
                        }
                    }
                    if (flag && value_valid) {
                        $variables[var_index].value = var_value;
                    } else {
                        $variables[var_index].value = '??????';
                    }
                    console.log($variables);
                }
            }
        }
        
        ok_button.toggleClass("hidden", !flag);
    };

    // json data parsing
    for (let blockgroup_index in json_Data.block_groups) {
        cnt_block_group++;
        // pick a block group
        let blockgroup = json_Data.block_groups[blockgroup_index];
        // block group id
        block_group_id = blockgroup.block_group_id;
        if (cnt_multiple_response[block_group_id] === undefined)
            cnt_multiple_response[block_group_id] = 0;
        
        // sub_index = 1;
        // createElement(blockgroup, block_group_id, false, 0, null, true);
        blockgroup_firstindex[block_group_id] = sub_index;
        createBlockGroup(blockgroup);
    }
    function createBlockGroup(blockgroup, prevElement = null) {
        // index of real block
        block_group_id = blockgroup.block_group_id;
        sub_index = blockgroup_firstindex[block_group_id];
        console.log(sub_index);
        // check whether multiple response is available or not
        enable_multiple_responses = false;
        if (include_key(blockgroup, 'enable_multiple_responses')) {
            enable_multiple_responses = blockgroup.enable_multiple_responses;
            if (enable_multiple_responses) {
                // how many times get response
                cnt_multiple_response[block_group_id]++;
            }
        }
        blockgroup_elements_id[block_group_id] = [];

        for (let element_json in blockgroup.blocks) {
            index++;
            sub_index++;
            total_index++;
            let json = blockgroup.blocks[element_json];
            // check json's correctivity
            let check_result = pre_check_json(json);
            if (check_result === null) {
                prevElement = createElement(json, block_group_id, enable_multiple_responses, cnt_multiple_response[block_group_id]-1, prevElement);
                blockgroup_elements_id[block_group_id] = blockgroup_elements_id[block_group_id].concat(prevElement.attr('id'));
            } else { // if json is not correct, return errors
                form.empty();
                let backword = '';
                switch (total_index % 10) {
                    case 1: backword = '\'st'; break;
                    case 2: backword = '\'nd'; break;
                    case 3: backword = '\'rd'; break;
                    default: backword = '\'th'; break;
                }
                form.append('Error occured in ' + total_index + backword + ' item: ' + check_result);
                form.append('<br>');
                form.append(JSON.stringify(json));
                $('.submit_button').parent().addClass('hidden');
                skip_to_id_list = [];
                break;
            }
        }
    }
    // hide elements with skip_to_id
    if (skip_to_id_list.length > 0) {
        console.log(skip_to_id_list);
        for (let index = 0 ; index < skip_to_id_list.length ; index++) {
            $('#id_'+skip_to_id_list[index]).addClass('hidden');
        }                
    }
    // bind variables to elements
    function bindVaraibles() {
        if (elements_with_variable.length > 0) {
            console.log(elements_with_variable);
            for (let index = 0 ; index < elements_with_variable.length ; index++) {
                updateTitleByVaraible(elements_with_variable[index]);
            }
        }
    }
    bindVaraibles();
    // check json correctivity
    function pre_check_json(json_) {
        if (!include_key(json_, 'block_type'))
            return 'Not defined "block_type"';
        if (!include_key(json_, 'block_id'))
            return 'Not defined "block_id"';
        if (!include_key(json_, 'title'))
            return 'Not defined "title"';

        if (json_.block_type == 'multiple_choice') {
            if (!include_key(json_, 'choices')) {
                return 'Not defined "choices"';
            } else {
                if (include_key(json_, 'choices').length == 0)
                    return 'No "choices"';
            }
        }

        return null;
    }

    // Keydown event handler (prevent default events for TAB and ENTER Key)
    $(document).keydown(function(event) {
        if (event.keyCode == 9 || (event.keyCode == 13 && $active_element.find('textarea').length == 0)) {
            event.preventDefault();
            return false;
        }
    });

    // keyup handler
    $(document).keyup(function(event){
        if ($active_element !== undefined || $active_element !== null) {
            if (event.keyCode == 40 || (!event.shiftKey && event.keyCode == 9)) { // Down 
                if (event.keyCode == 9) {
                    let $input_text = $active_element.find('input[type="text"]');
                    let length = $input_text.length;
                    if ($input_text.length > 1) {
                        let flag = false;
                        $input_text.each(function(i, input) {
                            let $input = $(input);
                            if (flag) {
                                $input.focus();
                                return false;
                            }
                            if ($input.is(':focus') && i < length-1) {
                                flag = true;
                            }
                        });
                        if (flag) return;
                    }
                }
                $nextel = $active_element.next();
                while ($nextel.hasClass('hidden')) {
                    $nextel = $nextel.next();
                    if ($nextel === undefined || $nextel === null)
                        break;
                }
                if ($nextel === undefined || $nextel === null) return;
                if ($nextel.length == 0) return;
                gotoElement($active_element, $nextel);
            } else if (event.keyCode == 38 || (event.shiftKey && event.keyCode == 9)) { // Up
                $nextel = $active_element.prev();
                while ($nextel.hasClass('hidden')) {
                    $nextel = $nextel.prev();
                    if ($nextel === undefined || $nextel === null)
                    break;
                }
                if ($nextel === undefined || $nextel === null) return;
                if ($nextel.length == 0) return;
                gotoElement($active_element, $nextel);
            } else if (event.keyCode == 13 && !event.shiftKey) { // Enter
                if ($active_element.find('textarea').length > 0) return;
                console.log('Enter');
                onClickOk($active_element);
            } else {
                let clickKey = String.fromCharCode(event.keyCode).toLowerCase();     
                if ($active_element.data('has_radio')) {
                    let $input_other_text = $active_element.find('input[type="text"]');
                    let flag = true;
                    if ($input_other_text.length > 0) {
                        if (!$input_other_text.parent().hasClass('hidden'))
                            flag = false;
                    }
                    if (flag) {
                        $active_element.find('.choice_keyboard').each(function(i, el) {
                            let $el = $(el);
                            let myKey = $el.text();
                            if (myKey === clickKey) {
                                choiceClicked($el.parent());
                            }
                        });
                    }
                }
            }
        }
    });
    // callback when scroll window
    $(window).scroll(function(event) {
        $('.question').each(function(i, e) {
            let ques = $(e);
            let top_y = ques.offset().top - $(window).scrollTop();
            if (top_y > window.innerHeight/2-ques.height() && top_y < window.innerHeight/2 && ques.hasClass('deactivated') && !ques.hasClass('hidden')) {
                if ($active_element !== undefined && $active_element !== null && $active_element != ques) {
                    $active_element.addClass('deactivated');
                    blurHandler($active_element);
                }
                ques.removeClass('deactivated');               
                $active_element = ques;
                focusHandler($active_element);

                event.preventDefault();
                return false;     
            }
        });
    });
    
    // clicking on blurred element
    
    function choiceClicked(el) {
        console.log('choiceClicked');
        clearPrevTimers();
        let $this = $(el);
        let $input_radio = $this.find('input[type="radio"]');
        if ($input_radio.length > 0) {
            let value = $input_radio.data('value');
            if (value == 'other') {
                $this.addClass('hidden');
                let $next = $this.next();
                $next.removeClass('hidden');
                $next.find('input').val('');
                focusHandler($next);
            } else {
                checkMe($this);
            }
        } else {
            
        }
    }
    function checkMe(el) {
        let $radio = $(el).parent().parent().parent();
        if (!$radio.hasClass('deactivated')) {
            let myInput = $(el).find('input');
            let myChecked = (myInput.attr('checked') !== undefined) || (myInput.attr('checked') == 'checked');
            let choiceCheck = $(el).parent().find('.choice_check');
            $(el).parent().find('div.radio').each(function(i, e) {
                let yourInput = $(e).find('input');
                if (myInput.attr('value') === yourInput.attr('value')) {
                    myInput.attr('checked', !myChecked);
                    $(e).toggleClass('choice_selected', !myChecked);
                    $(choiceCheck[i]).toggleClass('hidden_check', myChecked);
                } else {
                    yourInput.attr('checked', false);
                    $(e).removeClass('choice_selected');
                    $(choiceCheck[i]).addClass('hidden_check');
                    if (yourInput.data('value') == 'other') {
                        $(choiceCheck[i]).html('<i class="fas fa-edit">');
                        $(choiceCheck[i]).removeClass('hidden_check');
                    }
                }
            });

            let skip_to_id = myInput.data('skip_to_id');
            let submit_form = myInput.data('submit_form');

            // checked
            if (!myChecked) {
                $radio.data('required_result', [true]);

                if (submit_form) { // If submit form is true, submit form 
                    submit_form_id = $radio.attr('id');
                    $('form').submit();

                } else { // go to skip_to_id element
                    let flag = true;
                    if (skip_to_id != -1) {
                        myInput.siblings().each(function(i, el) {
                            let $el = $(el);
                            if ($el.data('skip_to_id') != -1) {
                                console.log('yes');
                                $('#id_'+skip_to_id).addClass('hidden');
                            };
                        });
                        $('#id_'+skip_to_id).removeClass('hidden');
                    } else {
                        skip_to_id = myInput.data('get_additional_response_group_id');
                        if (skip_to_id != -1) {
                            if (checkRequired(skip_to_id)) {
                                createBlockGroup($.grep(json_Data.block_groups, function(a) { return a.block_group_id == skip_to_id;})[0], $('#'+blockgroup_elements_id[skip_to_id][blockgroup_elements_id[skip_to_id].length-1]));
                                skip_to_id = blockgroup_elements_id[skip_to_id][0].substr(3);
                            } else {
                                skip_to_id = -1
                                flag = false;
                            }
                            checkMe(el);
                        }
                    }
                    if (flag) {
                        timers.push(setTimeout(function(){
                            onClickOk($active_element, skip_to_id);
                        }, 100));
                    }
                }
            } else {
                $radio.data('required_result', [false]);
                if (skip_to_id != -1)
                    $('#id_'+skip_to_id).addClass('hidden');
            }
        }
    }
    function checkRequired(block_group_id) {
        let flag = true;
        for (let index in blockgroup_elements_id[block_group_id]) {
            let block_id = blockgroup_elements_id[block_group_id][index];
            let $radio = $('#'+block_id);

            let has_required = $radio.data('required');
            let required_result = $radio.data('required_result');
            let has_validation = $radio.data('validation');
            let validation_result = $radio.data('validation_result');
            let $required_error = $radio.find('.required_error');
            let $regex_error = $radio.find('.validation_error');

            if (has_required) {
                if (checkArrayValues(required_result)) {
                    $required_error.addClass('hidden');
                    // check for validation
                    if (has_validation) {
                        if (checkArrayValues(validation_result)) { // ok
                            $regex_error.addClass('hidden');
                        } else {
                            flag = false;
                            $regex_error.removeClass('hidden');
                        }
                    } else { // ok
                        $regex_error.addClass('hidden');
                    }
                } else {
                    // error
                    flag = false;
                    $required_error.removeClass('hidden');
                }
            } else {
                $required_error.addClass('hidden');
                // check for validation
                if (has_validation) {
                    if (validation_result) { //ok
                        $regex_error.addClass('hidden');
                    } else {
                        flag = false;
                        $regex_error.removeClass('hidden');
                    }
                } else { // ok
                    $regex_error.addClass('hidden');
                }
            }
            if (!flag) {
                gotoElement($active_element, $radio);
                return false;
            }
        }

        for (let index in blockgroup_elements_id[block_group_id]) {
            let block_id = blockgroup_elements_id[block_group_id][index];
            let $radio = $('#'+block_id);
            $radio.addClass('hidden');
        }
        return true;
    }
    function clearPrevTimers() {
        for (let index = timers.length-1 ; index > -1 ; index--) {
            clearTimeout(timers[index]);
            timers.pop();
        }
    }
    // button callback
    function onClickOk(el, skip_to_id = -1) {
        let $el = $(el);
        if ($el.hasClass('deactivated')) return;
        bindVaraibles();
        
        let validation_result = $el.data('validation_result');
        console.log('validation_result =' + validation_result);
        if (!checkArrayValues(validation_result)) {
            let $regex_error = $el.find('.validation_error');
            $regex_error.removeClass('hidden');
            return;
        }

        let $nextel;
        if (skip_to_id != -1) {
            $nextel = $('#id_'+skip_to_id);
        } else {
            $nextel = $el.next();
            console.log($nextel);
            while ($nextel.hasClass('hidden')) {
                $nextel = $nextel.next();
                if ($nextel === undefined || $nextel === null)
                    break;
            }
            console.log($nextel);
        }
        if ($nextel !== undefined && $nextel !== null) {
            if ($nextel.length > 0)
                gotoElement(el, $nextel, true);
            else {
                submit_form_id = $el.attr('id');
                $('form').submit();
            }
        }
    }

    // scroll body to target element
    function gotoElement(oldel, newel, fromOnClickOk = false) {
        console.log('gotoElement');
        clearPrevTimers();
        
        let $oldel = $(oldel);
        let flag = false;
        if ($oldel.data('required')) {
            console.log('----------------------');
            console.log($oldel);
            console.log($oldel.data('required_result'));
            console.log('----------------------');
            if (!checkArrayValues($oldel.data('required_result'))) {
                $oldel.find('.required_error').removeClass('hidden');
                $oldel.find('.validation_error').addClass('hidden');
                focusHandler($oldel);
                console.log('~~~~~~~~~~~~~');
                if (fromOnClickOk) return;
            }
        }
        if ($oldel.data('validation')) {
            if (!$oldel.data('validation_result')) {
                $oldel.find('.required_error').addClass('hidden');
                $oldel.find('.validation_error').removeClass('hidden');
                focusHandler($oldel);
                if (fromOnClickOk) return;
            }
        }
        blurHandler($oldel);
        
        ///////////
        let $newel = $(newel);
        $('html, body').animate({
            scrollTop: $newel.offset().top - window.innerHeight/2 + $newel.height()/2
        }, 300);
        focusHandler($newel);
    }
    function focusHandler(el) {
        let $el = $(el);
        let $input = $el.find('input[type="text"], input[type="date"], textarea');
        if ($input.length > 0) {
            $input[0].focus();
        }
    }
    function blurHandler(el) {
        let $el = $(el);
        let $input = $el.find('input[type="text"], input[type="date"], textarea');
        if ($input.length > 0) {
            $input.blur();
        }
        let block_type = $el.data('block_type');
        if (block_type == 'multiple_choice') {
            $el.find('input[type="radio"]').each(function(i, el) {
                let $radio_other = $(el);
                if ($radio_other.data('value') == 'other') {
                    let $parent = $radio_other.parent();
                    if ($parent.hasClass('hidden')) {
                        $parent.removeClass('hidden');
                        $parent.next().addClass('hidden');
                    }
                }
    
            });
        }
    }
    // auto height textarea
    $('.auto-text-area').on('keyup',function(){
        $(this).css('height','auto');
        $(this).height(this.scrollHeight);
    });
    // create element
    function createElement(json, block_group_id, cloneable = false, index = -1, prevElement = null, is_block_group = false,) {
        var element;
        if (is_block_group) {
            element = createQuestionGroup(json, block_group_id);
        } else {

            switch (json.block_type) {
                case 'short_text':
                    element = createShortText(json, block_group_id, cloneable, index);
                    element.data('has_radio', false);
                    break;
                case 'long_text':
                    element = createLongText(json, block_group_id, cloneable, index);
                    element.data('has_radio', false);
                    break;
                case 'multiple_choice':
                    element = createMultipleChoice(json, block_group_id, cloneable, index);
                    element.data('has_radio', true);
                    break;
                case 'date':
                    element = createDate(json, block_group_id, cloneable, index);
                    element.data('has_radio', false);
                    break;
                case 'statement':
                    sub_index--;
                    element = createStatement(json, block_group_id, cloneable, index);
                    element.data('has_radio', false);
                    break;
                case 'physical_address':
                    element = createPhysicslAddress(json, block_group_id, cloneable, index);
                    element.data('has_radio', false);
                    break;
                case 'legal_agreement':
                    element = createLegalAgreement(json, block_group_id, cloneable, index);
                    element.data('has_radio', true);
                    break;
                case 'signature':
                    element = createSignature(json, block_group_id, cloneable, index);
                    element.data('has_radio', false);
                    console.log(element.find("#signature"));
                    
                    break;
                default:
                    return null;
                    break;
            }
            element.data('block_type', json.block_type);
            element.data('block_group_id', block_group_id);
            
            if (include_key(json, 'set_variables')) {
                element.data('variables', json.set_variables);
                for (let index = 0 ; index < json.set_variables.length ; index++) {
                    $variables.push({
                        name: json.set_variables[index].name,
                        value: include_key(json.set_variables[index], 'value') ? json.set_variables[index].value : '??????'
                    });
                }
            }
            if (json.title.search('@') > -1) {
                element.data('title', json.title);
                elements_with_variable.push(element);
            }
        }
        if (prevElement === null)
        form.append(element);
        else
            prevElement.after(element);

        cnt_element++;
        if (cnt_element == 1) {
            $(element).removeClass('deactivated');
            $active_element = $(element);
        } else {
            $(element).addClass('deactivated');
        }
        $(element).click(function(){
            console.log("question clicked");
            if ($(this).hasClass('deactivated')) {
                gotoElement($active_element, $(this));
            }
        });
        element.find('div.radio').click(function(){
            if (!child_clicked)
                choiceClicked(this);
            child_clicked = false;
        });
        element.find('.ok_button').click(function() {
            onClickOk($(this).parent().parent().parent());
        });
        element.find('.other_confirm_button').click(function() {
            $this = $(this);
            $myRadio = $this.parent();
            $mainRadio = $myRadio.prev();
    
            $myRadio.addClass('hidden');
            $input_text = $myRadio.find('input[type="text"]');
    
            $mainRadio.removeClass('hidden');
            let $input_radio = $mainRadio.find('input[type="radio"]');
            $input_radio.attr('value', $input_text.val());
    
            let $question_text = $mainRadio.find('.choice_question');
            // change value to the inputted text
            $question_text.text($input_text.val());
            // change icon to 'check' from 'edit'
            $main_span = $mainRadio.find('.choice_check');
            $main_span.html('<i class="fas fa-check">');
            // check and go to next
            checkMe($mainRadio);
            child_clicked = true;
        });
        return element;
    }
    console.log($variables);
    function updateTitleByVaraible(el) {
        let $el = $(el);
        let sztitle_ = $el.data('title');
        let sztitle = sztitle_;
        console.log(sztitle);
        let $title = $el.find('.title');
        let regex = /@[0-9A-Za-z_]+/;
        let matches = regex.exec(sztitle);
        console.log(matches);
        if (matches == null) return;
        console.log('#####' + sztitle);
        console.log(matches);
        for (let index = 0 ; index < matches.length ; index++) {
            let variable = matches[index].substr(1);
            for (let var_index = 0 ; var_index < $variables.length ; var_index++) {
                if (variable == $variables[var_index].name) {
                    console.log('found same#####');
                    sztitle = sztitle.replace(matches[index], $variables[var_index].value);
                    console.log(sztitle);
                    break;
                }
            }
        }
        $title.html(sztitle);
    }

    // check key is or not in json
    function include_key(json_, key_)
    {
        if (json_.hasOwnProperty(key_)) {
            return true;
        }
        return false;
    }
    // question index
    function addQuestionIndex(is_quote=false, subindex = true) {
        var strIndex = '<div class="questionIndex">';
        if (!is_quote) {
            strIndex += '<span><strong>'+sub_index+'.</strong>';
        } else {
            strIndex += '<i class="fas fa-quote-left"></i>';
        }
        strIndex += '</div>';
        return strIndex;
    }
    // ok or continue button
    function addOkButton(is_ok=true) {
        var strIndex = '<div class="pressEnter hidden">';
        strIndex += '<span class="ok_button"><span><strong>'+(is_ok?'OK':'Continue')+'</strong>   <i class="fas fa-check"></i></span></span>';
        strIndex += '<span class="ok_description">press <strong>'+OK_BUTTON_DESCRIPTION+'</strong></span>';
        strIndex += '</div>';
        return strIndex;
    }

    function addTitle(title) {
        return '<h1 class="title">' + title+'</h1>'
    }
    function addDescription(description) {

    }
    function addRequired(el, required_) {
        $el = $(el);
        $el.data('required', required_)
    }
    function addRequiredError() {
        return '<label class="hidden required_error">Please fill this in</label>';
    }
    function addValidationError(content) {
        return '<label class="hidden validation_error">'+ content +'</label>'
    }
    function createQuestionGroup(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question">';
        strElement += addQuestionIndex(false, false);
        strElement += '<h1 class="title">' + json.title+'</h1>';
        if (json.hasOwnProperty('description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        if (include_key(json, 'img') && include_key(json, 'img_max_width') && include_key(json, 'img_max_height')) {
            strElement += '<img src="'+json.img+'" width='+json.img_max_width+'px height='+json.img_max_height+'px>';
        }
        strElement += addOkButton(false);
        strElement += '</div></div>';
        
        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', false);
        element.data('required_result', [true]);
        element.data('validation', false);
        element.data('validation_result', [true]);

        element.find('.pressEnter').removeClass('hidden');
        return element;
    }
    function createShortText(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex();
        strElement += '<p class="title">'+ json.title +'</p>';
        if (include_key(json, 'description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        strElement += '<input type="text" class="form-control" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'" placeholder="Type your answer here...">';
        strElement += addRequiredError();
        strElement += addValidationError(include_key(json, 'validation_regex_error') ? json.validation_regex_error : '');
        strElement += addOkButton();
        strElement += '</div></div>';

        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', required_);
        if (required_)
            element.data('required_result', [false]);
            
        let validation_ = include_key(json, 'validation_ajax') ? json.validation_ajax : false;
        element.data('validation', validation_);
        if (validation_) {
            element.data('validation_result', [false]);
            element.data('validation_regex', [include_key(json, 'validation_regex') ? json.validation_regex : '']);
        }
        element.find('input').data('index', 0);
        element.find('input').on('input', inputEvent);
        return element;
    }

    function createLongText(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex();
        strElement += '<h1 class="title">' + json.title+'</h1>';
        if (json.hasOwnProperty('description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        strElement += '<textarea type="text" class="form-control auto-text-area" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'" rows="1"  placeholder="Type your answer here..."></textarea>';
        strElement += addRequiredError();
        strElement += addValidationError(include_key(json, 'validation_regex_error') ? json.validation_regex_error : '');
        strElement += addOkButton();
        strElement += '</div></div>';

        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', required_);
        if (required_)
            element.data('required_result', [false]);
            
        let validation_ = include_key(json, 'validation_ajax') ? json.validation_ajax : false;
        element.data('validation', validation_);
        if (validation_) {
            element.data('validation_result', [false]);
            element.data('validation_regex', [include_key(json, 'validation_regex') ? json.validation_regex : '']);
        }
        element.find('textarea').data('index', 0);
        element.find('textarea').on('input', inputEvent);
        return element;
    }

    function createMultipleChoice(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex();
        strElement += '<h1 class="title">'+ json.title+'</h1>';
        if (json.hasOwnProperty('description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent"><div style="display:inline-block">';
        for (let index in json.choices) {   
            let choice = json.choices[index];
            strElement += '<div class="radio">';
            strElement += '<input type="radio" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'" value="'+choice.name+'">';
            strElement += '<span class="choice_keyboard">'+choice.keyboard+'</span>';
            strElement += '<span class="choice_question">'+choice.text+'</span>';
            if (choice.name == 'other') {
                strElement += '<span class="choice_check"><i class="fas fa-edit"></i></i>';
                strElement += '</div>';
                strElement += '<div class="radio hidden">';
                strElement += '<input type="text" name="edit">';
                strElement += '<span class="other_confirm_button hidden"><i class="fas fa-check-circle"></i></span>';
                strElement += '</div>';
            } else {
                strElement += '<span class="choice_check hidden_check"><i class="fas fa-check"></i></span>';
                strElement += '</div>';
            }

            if (include_key(choice, 'set_variables')) {
                for (let index = 0 ; index < choice.set_variables.length ; index++) {
                    $variables.push({
                        name: choice.set_variables[index].name,
                        value: include_key(choice.set_variables[index], 'value') ? choice.set_variables[index].value : '??????'
                    });
                }
            }
        }
        strElement += addRequiredError();
        strElement += addValidationError(include_key(json, 'validation_regex_error') ? json.validation_regex_error : '');
        strElement += '</div></div>';

        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', required_);
        if (required_)
            element.data('required_result', [false]);
            
        element.data('validation', false);
        element.data('validation_result', [true]);

        element.find('input[type="radio"]').each(function(i, el) {
            let radio = $(el);
            radio.data('value', json.choices[i].name);

            // skip_to_id
            if (include_key(json.choices[i], 'skip_to_id')) {
                let skip_to_id = json.choices[i].skip_to_id;
                radio.data('skip_to_id', skip_to_id);
                let index = skip_to_id_list.findIndex(x => x == skip_to_id);
                if (index == -1)
                    skip_to_id_list.push(skip_to_id);
            } else {
                radio.data('skip_to_id', -1);
            }

            // get_additional_response_group_id
            if (include_key(json.choices[i], 'get_additional_response_group_id')) {
                let get_additional_response_group_id = json.choices[i].get_additional_response_group_id;
                radio.data('get_additional_response_group_id', get_additional_response_group_id);
            } else {
                radio.data('get_additional_response_group_id', -1);
            }

            // submit_form
            radio.data('submit_form', false);
            if (include_key(json.choices[i], 'submit_form')) {
                radio.data('submit_form', json.choices[i].submit_form);
            }

        });
        element.find('input').on('input', inputEvent);
        return element;
    }

    function createDate(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex();
        strElement += '<h1 class="title">' + json.title+'</h1>';
        if (include_key(json, 'description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        strElement += '<input type="date" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'">';
        strElement += addRequiredError();
        strElement += addValidationError(include_key(json, 'validation_regex_error') ? json.validation_regex_error : '');
        strElement += addOkButton();
        strElement += '</div></div>';

        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', required_);
        if (required_)
            element.data('required_result', [false]);
            
        let validation_ = include_key(json, 'validation_ajax') ? json.validation_ajax : false;
        element.data('validation', validation_);
        if (validation_) {
            element.data('validation_result', [false]);
            element.data('validation_regex', [include_key(json, 'validation_regex') ? json.validation_regex : '']);
        }
        element.find('input').data('index', 0);
        element.find('input').on('input', inputEvent);
        return element;
    }

    function createStatement(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex(true);
        strElement += '<h1 class="title">' + json.title+'</h1>';
        if (json.hasOwnProperty('description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        if (include_key(json, 'img') && include_key(json, 'img_max_width') && include_key(json, 'img_max_height')) {
            strElement += '<img src="'+json.img+'" width='+json.img_max_width+'px height='+json.img_max_height+'px>';
        }
        strElement += addOkButton(false);
        strElement += '</div></div>';
        
        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', false);
        element.data('required_result', [true]);
        element.data('validation', false);
        element.data('validation_result', [true]);

        element.find('.pressEnter').removeClass('hidden');
        return element;
    }

    function createPhysicslAddress(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex();
        strElement += '<h1 class="title">' + json.title+'</h1>';
        if (json.hasOwnProperty('description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        strElement += '<div class="form-row">';
        strElement += '<div class="form-group col-md-12 address">';
        strElement += '<label for="inputAddress">Address</label>';
        strElement += '<input type="text" class="form-control" name="'+json.block_id+'_address_line_1'+(cloneable ? '['+index+']' : '')+'" placeholder="1234 Main St">';
        strElement += '</div>';
        strElement += '<div class="form-group col-md-12 address">';
        strElement += '<label for="inputAddress2">Address 2</label>';
        strElement += '<input type="text" class="form-control" name="'+json.block_id+'_address_line_2'+(cloneable ? '['+index+']' : '')+'" placeholder="Apartment, studio, or floor">';
        strElement += '</div></div>';
        strElement += '<div class="form-row">';
        strElement += '<div class="form-group col-md-6 address">';
        strElement += '<label for="inputCity">City</label>';
        strElement += '<input type="text" class="form-control" name="'+json.block_id+'_city'+(cloneable ? '['+index+']' : '')+'">';
        strElement += '</div>';
        strElement += '<div class="form-group col-md-4 address">';
        strElement += '<label for="inputState">State</label>';
        strElement += '<input type="text" class="form-control" name="'+json.block_id+'_state'+(cloneable ? '['+index+']' : '')+'">';
        strElement += '</div>';
        strElement += '<div class="form-group col-md-2 address">';
        strElement += '<label for="inputZip">Zip</label>';
        strElement += '<input type="text" class="form-control" name="'+json.block_id+'_postal_code'+(cloneable ? '['+index+']' : '')+'">';
        strElement += '</div>';  
        strElement += '</div>';
        strElement += addRequiredError();
        strElement += addValidationError(include_key(json, 'validation_regex_error') ? json.validation_regex_error : '');
        strElement += addOkButton();
        strElement += '</div></div>';

        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', required_);
        if (required_) {
            element.data('required_result', [false, true, false, false, false]);
        }
            
        let validation_ = include_key(json, 'validation_ajax') ? json.validation_ajax : false;
        element.data('validation', validation_);
        if (validation_) {
            element.data('validation_result', [false, true, false, false, false]);
            element.data('validation_regex', [/[A-Za-z0-9]+/g, /[A-Za-z0-9]+/g, /[A-Za-z ]+/g, /[A-Za-z ]+/g, /^\d{5}(?:[-\s]\d{4})?$/g]);
        }
        element.find('.questionContent').find('input').each(function(i, ip) {
            $(ip).data('index', i);
            if (i == 1)
                $(ip).data('ignore', true);
        });
        element.find('input').on('input', inputEvent);
        return element;
    }
    function createLegalAgreement(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex();
        strElement += '<h1 class="title">'+ json.title+'</h1>';
        if (json.hasOwnProperty('description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        strElement += '<div class="legal_agreement">' + json.legalese+'</div><br><br>';
        strElement += '<div style="display:inline-block">';

        for (let index in json.choices) {   
            let choice = json.choices[index];
            strElement += '<div class="radio">';
            strElement += '<input type="radio" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'" value="'+choice.name+'">';
            strElement += '<span class="choice_keyboard">'+choice.keyboard+'</span>';
            strElement += '<span class="choice_question">'+choice.text+'</span>';
            if (choice.name == 'other') {
                strElement += '<span class="choice_check"><i class="fas fa-edit"></i></i>';
                strElement += '</div>';
                strElement += '<div class="radio hidden">';
                strElement += '<input type="text" name="edit">';
                strElement += '<span class="other_confirm_button hidden"><i class="fas fa-check-circle"></i></span>';
                strElement += '</div>';
            } else {
                strElement += '<span class="choice_check hidden_check"><i class="fas fa-check"></i></span>';
                strElement += '</div>';
            }

            if (include_key(choice, 'set_variables')) {
                for (let index = 0 ; index < choice.set_variables.length ; index++) {
                    $variables.push({
                        name: choice.set_variables[index].name,
                        value: include_key(choice.set_variables[index], 'value') ? choice.set_variables[index].value : '??????'
                    });
                }
            }
        }
        strElement += addRequiredError();
        strElement += addValidationError(include_key(json, 'validation_regex_error') ? json.validation_regex_error : '');
        strElement += '</div></div>';

        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', required_);
        if (required_)
            element.data('required_result', [false]);
            
        element.data('validation', false);
        element.data('validation_result', [true]);

        element.find('input[type="radio"]').each(function(i, el) {
            let radio = $(el);
            radio.data('value', json.choices[i].name);
            if (include_key(json.choices[i], 'skip_to_id')) {
                let skip_to_id = json.choices[i].skip_to_id;
                radio.data('skip_to_id', skip_to_id);
                let index = skip_to_id_list.findIndex(x => x == skip_to_id);
                if (index == -1)
                    skip_to_id_list.push(skip_to_id);
            } else {
                radio.data('skip_to_id', -1);
            }
            if (include_key(json.choices[i], 'get_additional_response_group_id')) {
                let get_additional_response_group_id = json.choices[i].get_additional_response_group_id;
                radio.data('get_additional_response_group_id', get_additional_response_group_id);
            } else {
                radio.data('get_additional_response_group_id', -1);
            }
            radio.data('submit_form', false);
            if (include_key(json.choices[i], 'submit_form')) {
                radio.data('submit_form', json.choices[i].submit_form);
            }

        });
        element.find('input').on('input', inputEvent);
        return element;
    }
    function createSignature(json, block_group_id, cloneable = false, index = -1) {
        var strElement = '';
        strElement = '<div class="form-group question" id="id_'+json.block_id+(cloneable ? '_'+index : '')+'">';
        strElement += addQuestionIndex();
        strElement += '<h1 class="title">' + (isMobile ? json.title_touch : json.title) +'</h1>';
        if (json.hasOwnProperty('description')) {
            strElement += '<h2 class="description">'+ json.description +'</h2>';
        }
        strElement += '<div class="questionContent">';
        if (isMobile) {
            strElement += '<div class="signature_result">';
            strElement += '<img src="data:image/gif;base64,R0lGODlhRAIEAaIAAOLi1v7+5enp2ubm2Pf34e7u3QAAAAAAACH5BAAHAP8ALAAAAABEAgQBAAP/GLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM90bd94ru987//AoHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mix/6PHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv38CDCx9OvLjx48iTK1/OvLnz59CjS59Ovbr169g5CADAnUCE7QAEZE9DgDuAARAKmB+vZoB57w3Ud2dP3rx4BuXn009jHgD8AP/5AVDAfmrIF94C5g1IoBr9eQfefQumYWABBkbIRn/vWbgGeBlqqEaAAnq4BogKingGiNyZiAaG+qk4xoMBoueiGPLJ2OCMYBgIn4EQ4rhFgP8FcKOPWgRYogITEqlFgg/0pyQWD6bHZAMsYuhAlVZSieV6Wm4JwJVeftnllmB6WSaZY2J5ppppVrmmm22y+KaccWbJQJhi3hnmnHYiuGedTgLKpZ5mCpqioXn6WSihaDLKpqNwQkrnC1FGEKiklyraqKaPchqpp5OC2qcCePKZKal/YnqqkKmKumqpiJo6qKuzoroorYeqWiurt9q6qa+dAvupsKESOyqvvyIbrLKKwzJbLAsERDtBtNIaKmuuuCZq7KutbrsrrLpi6624zh4LbrbXalsut72u+2237pJ77rjqzhtvvfDaq2++/LZr75MAByzwwAQXbPDBCCes8MIMN+zwwxBHLPHEFFds8cUYZ6zxxhx37PHHIIcs8sgkl2zyySinrPLKLLfs8sswxyzzzDTXbPPNbiUAADs=" width=200px height=100px">';
            strElement += '<div class="sign_button">Click to Sign <span><i class="fas fa-pencil-alt"></i></span></div>';
            strElement += '</div>';
        }
        if (isMobile) {
            strElement += '<input type="text" id="signature_input_png" class="form-control'+(isMobile ? ' hidden' : '')+'" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'_png" placeholder="Type your fullname here...">';
            strElement += '<input type="text" id="signature_input_svg" class="form-control'+(isMobile ? ' hidden' : '')+'" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'_svg" placeholder="Type your fullname here...">';
        } else {
            strElement += '<input type="text" id="signature_input_name" class="form-control'+(isMobile ? ' hidden' : '')+'" name="'+json.block_id+(cloneable ? '['+index+']' : '')+'" placeholder="Type your fullname here...">';
        }
        strElement += addRequiredError();
        strElement += addValidationError(include_key(json, 'validation_regex_error') ? json.validation_regex_error : '');
        strElement += addOkButton();
        strElement += '</div></div>';

        var element = $(strElement);
        let required_ = include_key(json, 'required') ? json.required : false;
        element.data('required', required_);
        if (required_)
            element.data('required_result', [true]);
            
        let validation_ = include_key(json, 'validation_ajax') ? json.validation_ajax : false;
        element.data('validation', validation_);
        if (validation_) {
            element.data('validation_result', false);
            element.data('validation_regex', [/^[A-Za-z0-9:;/+,.=]+/g]);
        }
        element.find('input').data('index', 0);
        element.find('input').on('input', inputEvent);
        return element;
    }

    /** Submit */

    $('form').submit(function(event) { 
        if (!checkFormData()) {
            event.preventDefault();
            return false;
        }
        $('input[name="edit"]').remove();
    });
    function checkFormData() {
        console.log('submit_id = ' + submit_form_id);
        let flag = true;
        $('.question').each(function(i, el) {
            let $radio = $(el);
            if (!$radio.hasClass('hidden')) {

                let has_required = $radio.data('required');
                let required_result = $radio.data('required_result');
                let has_validation = $radio.data('validation');
                let validation_result = $radio.data('validation_result');
                let $required_error = $radio.find('.required_error');
                let $regex_error = $radio.find('.validation_error');
                
                if (has_required) {
                    if (checkArrayValues(required_result)) {
                        $required_error.addClass('hidden');
                        // check for validation
                        if (has_validation) {
                            if (checkArrayValues(validation_result)) { // ok
                                $regex_error.addClass('hidden');
                            } else {
                                flag = false;
                                $regex_error.removeClass('hidden');
                            }
                        } else { // ok
                            $regex_error.addClass('hidden');
                        }
                    } else {
                        // error
                        flag = false;
                        $required_error.removeClass('hidden');
                    }
                } else {
                    $required_error.addClass('hidden');
                    // check for validation
                    if (has_validation) {
                        if (validation_result) { //ok
                            $regex_error.addClass('hidden');
                        } else {
                            flag = false;
                            $regex_error.removeClass('hidden');
                        }
                    } else { // ok
                        $regex_error.addClass('hidden');
                    }
                }
                console.log('current_id = ' + $radio.attr('id'));
                if (!flag) {
                    gotoElement($active_element, $radio);
                    return false;
                }
                if ($radio.attr('id') === submit_form_id) {
                    return false;
                }
            }
        });
        return flag;
    }
    function checkArrayValues(array) {
        for (let index in array) {
            if (!array[index]) return false;
        }
        return true;
    }
    /**  Signature  */
        // Initialize Signature Pad if mobile...
    if (isMobile)
    {
        signaturePad = new SignaturePad(document.getElementById("signature-canvas"));
    }
    $('.signature_result').click(function() {
        $('.signature-overlay').addClass('signature-show');
    });
    $('.add-signature-btn').click(function() {
        var svgDataURL = signaturePad.toDataURL('image/svg+xml');
        var pngDataURL = signaturePad.toDataURL('image/png');
        console.log(svgDataURL);
        console.log(pngDataURL);
        $('.signature_result img').attr('src', pngDataURL);
        $('#signature_input_png').val(pngDataURL); //encodeURIComponent
        $('#signature_input_svg').val(svgDataURL); //encodeURIComponent
        $('#signature_input_png').trigger('input');
        $('#signature_input_svg').trigger('input');
        $('.signature-overlay').removeClass('signature-show');
    });
    $('.clear-signature-btn').click(function() {
        signaturePad.clear();
    });
    $('.close-signature-btn').click(function() {
        $('.signature-overlay').removeClass('signature-show');
    });
})(jQuery);
