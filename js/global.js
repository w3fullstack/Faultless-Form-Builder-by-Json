var json_Data = {
    block_groups: [
      {
        block_group_id: 901,
        title: '901',
        blocks: [      
          {
            block_type: 'statement',
            block_id: 1000,
  
            title: '<strong>Thank you</strong> for your interest in working for Acme.',
  
            description: 'Acme is an <strong>equal-opportunity</strong>, <strong>affirmative-action</strong> employer.',
  
            img: 'https://images.typeform.com/images/Ht8p6FvCjNfP/image/default',
            img_max_width: 200,
            img_max_height: 150,
  
            button: 'Start My Job Application',
          },

          {   
            block_type: 'short_text',
            block_id: 1001,
            // IDs are not necessarily consecutive
  
            // This is the field’s @variable name in case it needs to be referenced in a future question.
            // In the POST to the server, the fields are referenced by their block ID, not their @variable name: 
            // { 1000: 'John Doe', 1003: '5552834059' }
  
            title: 'Let’s get started.<br />What’s your <strong>full name</strong>?',
            // UTF-8 encoded apostrophes
            required: true,
            validation_regex: /^([\w'’‘]+).*([\w'’‘]+)/,
            validation_regex_error: 'Please type your first and last name.',
  
            set_variables: [
              { name: 'full_name', entire_input: true }, 
              { name: 'first_name', regex_match: 1 } 
            ] // Do not return these to the server in POST
          },

          {
            block_type: 'short_text',
            block_id: 1002,
      
            set_variables: [
             { name: 'phone_number', entire_input: true }
            ],
  
            title: 'Thanks, @first_name. What’s your <strong>phone number</strong>?',
            // When processing questions' text, search for variables that have already been defined, and replace them with their string value.
  
            validation_regex: /.*(\d.*){10,}/,
            validation_regex_error: 'That doesn’t look like a valid phone number.',
            validation_ajax: true,
            required: true
            // First validate the regex.
            // If that passes, do server-side validation.
            // If it takes more than 3 seconds to receive a response from the server:
            // • Let the customer move on to a different question
            // • Even if you get a response from the server later, do not show an error message ...
            //   ... that error can be handled at final form submission.
            // • If you do get a response from the server and the user has not edited the field set any variables included in the response
            // • If you do get a response from the server and the user has 
          },
    
          {
            block_type: 'short_text',
            block_id: 1003,
            // IDs are in no particular order
      
            set_variables: [
              { name: 'email_address', entire_input: true }
            ],
      
            title: 'What’s your <strong>email address</strong>?',
      
            required: true,
            // If the field is blank (except for possible whitespace), required:false means the user can proceed even if the regex fails.
            // To enable this, the text in EVERY <input> should be trim()ed before any validation occurs.
            // If a question IS required and is left blank, an the error message "Please fill this in" appears as in TypeForm
            
            validation_regex: /.*@.*\..{2,}/,
            validation_regex_error: 'That doesn’t look like a valid email address.',
            validation_ajax: true,
          },

          {
            block_type: 'multiple_choice',
            block_id: 1004,
            required: false,
            title: 'When are you <strong>available</strong> to start working?',
      
            choices: [
              {
                keyboard: 'a', // A or a will work as a keyboard shortcut (case-insensitive)
                name: 'immediately',
                text: 'Immediately',
                skip_to_id: 1006,
                // skip_to_id will be somewhere in sequence AFTER the current question. 
                // skip_to_id never takes the user back, it only skips questions.
              },
              {
                keyboard: 'b',
                name: 'two_weeks',
                text: 'With 2 weeks’ notice',
                skip_to_id: 1006,
              },
              {
                keyboard: 'c',
                name: 'on_date',
                text: 'On a certain date',
                skip_to_id: 1005,
                // since there was no jump, just proceed to the next question in the JSON 
              },
              {
                keyboard: 'd',
                name: 'other',
                text: 'Other…',
                skip_to_id: 1006,
                type: 'text_input', // Turns the button into a text <input>, as in TypeForm’s 'Other' selection
              },
            ]
          },
    
          {
            block_type: 'date',
            block_id: 1005,
      
            name: 'start_date_date',
      
            title: 'When are you <strong>available</strong> to start working?',
      
            required: false,
            // If the field is blank (except for possible whitespace), required:false means the user can proceed even if the regex fails.
            // To enable this, the text in every <input> should be trim()ed before any validation occurs.
            // If a question IS required and is left blank, an the error message "Please fill this in" appears as in TypeForm
            
            validation_regex: /(\d{4})-(\d{2})-(\d{2})/,
            validation_regex_error: 'That doesn’t look like a valid date.',
            validation_ajax: true,
          },
    
          {
            block_type: 'short_text',
            block_id: 1006,
      
            title: 'Are there any days, shifts, or <strong>hours you are unavailable to work</strong>?',
      
            required: true,
          },
    
          {
            block_type: 'multiple_choice',
            block_id: 1007,
      
            title: 'Are you available to work <strong>overtime</strong>, if required?',
      
            choices: [
              {
                keyboard: 'y',
                name: 'yes',
                text: 'Yes',
              },
              {
                keyboard: 'n',
                name: 'no',
                text: 'No',
              },
              {
                keyboard: 'o',
                name: 'other',
                text: 'Other…',
                type: 'text_input',
              },
            ]
      
          },
    
          {
            block_type: 'multiple_choice',
            block_id: 1008,
      
            title: 'Are you available for <strong>out-of-town work</strong>?',
      
            choices: [
              {
                keyboard: 'y',
                name: 'yes',
                text: 'Yes',
              },
              {
                keyboard: 'n',
                name: 'no',
                text: 'No',
              },
              {
                keyboard: 'o',
                name: 'other',
                text: 'Other…',
                type: 'text_input',
              }
            ]
          },
    
          {
            block_type: 'short_text',
            block_id: 1009,
      
            title: 'What’s your <strong>desired pay</strong>?',
            
            label_before_input: '$',
            // left aligned, immutable text put inline, before the text field
            label_after_input: 'per hour',
            // left aligned, immutable text put inline, before the text field
      
            required: false,
          },
    
          {
            block_type: 'multiple_choice',
            block_id: 1010,
      
            title: 'Are you <strong>eligible to work</strong> in the United States?',
      
            description: 'If you have a Social Security card and a driver’s license, choose <strong>Yes</strong>.',
      
            choices: [
              {
                keyboard: 'y',
                name: 'yes',
                text: 'Yes',
                skip_to_id: 1012,
              },
              {
                keyboard: 'n',
                name: 'no',
                text: 'No',
                submit_form: true,
                // This has reached the end of our workflow. POST the form.
              },
              {
                keyboard: 'o',
                name: 'not-sure',
                text: 'I’m not sure',
                skip_to_id: 1011,
              }
            ]
      
          },
    
          {
            block_type: 'statement',
            block_id: 1011,
  
            title: 'In order to work for Acme, you must have valid documentation.',
  
            description: 'Acceptable documents are listed on form&nbsp;I-9.<br />We use E-Verify.',
  
            button: 'I Understand',
          },

          {
            block_type: 'multiple_choice',
            block_id: 1012,
  
            title: 'Have you used any illegal <strong>drugs</strong> in the past 30 days?',
  
            description: 'A drug test is required.',
  
            choices: [
              {
                keyboard: 'y',
                name: 'yes',
                text: 'Yes',
                submit_form: true,
                // This has reached the end of our workflow. POST the form.
              },
              {
                keyboard: 'n',
                name: 'no',
                text: 'No',
              },
              {
                keyboard: 'i',
                name: 'not-sure',
                text: 'I’m not sure',
              }
            ]
          },
    
          {
            block_type: 'multiple_choice',
            block_id: 1013,
  
            title: 'Have you <strong>ever applied for a job with Acme</strong> before?',
  
            choices: [
              {
                keyboard: 'y',
                name: 'yes',
                text: 'Yes',
              },
              {
                keyboard: 'n',
                name: 'no',
                text: 'No',
                skip_to_id: 1015,
              },
              {
                keyboard: 'i',
                name: 'not-sure',
                text: 'I’m not sure',
              }
            ]
          },
    
          {
            block_type: 'short_text',
            block_id: 1014,
      
            title: '<strong>When did you previously apply</strong> to work for us?',
      
            required: false,
          },
    
          {
            block_type: 'multiple_choice',
            block_id: 1015,
  
            title: 'Have you ever been <strong>convicted of a crime</strong>?',
      
            description: 'A conviction does not necessarily disqualify you.',
  
            choices: [
              {
                keyboard: 'y',
                name: 'yes',
                text: 'Yes',
                set_variables: [
                  { name: 'description_of_convictions', value: 'criminal conviction(s)' } 
                ]
              },
              {
                keyboard: 'n',
                name: 'no',
                text: 'No',
                skip_to_id: 1017
              },
              {
                keyboard: 'i',
                name: 'not-sure',
                text: 'I’m not sure',
                set_variables: [
                  { name: 'convictions_description', value: 'possible criminal conviction(s)' } 
                ]
              }
            ]
          },
    
          {
            block_type: 'short_text',
            block_id: 1016,
      
            title: 'Please tell us more about the <strong>@convictions_description</strong>:',
      
            description: 'Conviction(s) do not necessarily disqualify you, but we need more information to process your application.',
      
            required: false,
          },
    
          {
            block_type: 'long_text',
            block_id: 1017,
      
            title: 'Please describe any <strong>skills, experience, training, or education</strong> that may be relevant to the position:',
              
            required: false
          },
          
          {
            block_type: 'statement',
            block_id: 1018,
  
            title: 'Thanks, @first_name!<br />Next, we have some questions about your <strong>employment history</strong>.',
            
            button: 'Continue',
          }
          
    
        ]
      },

      {
        block_group_id: 902,
        enable_multiple_responses:true,
        title: '902',
        blocks: [      
          {
            block_type: 'short_text',
            block_id: 2000,
  
            title: 'What’s the name of <strong>your most recent employer</strong>?',
            
            required: true,
            
            set_variables: [
              { name: 'this_employer_name', entire_input: true }, 
              // if the variable already exists, overwrite it
              // (because this block_group may be repeated)
            ]
          },

          {
            block_type: 'short_text',
            block_id: 2001,
  
            title: 'What’s the phone number for @this_employer_name?',

            validation_regex: /.*(\d.*){10,}/,
            validation_regex_error: 'That doesn’t look like a valid phone number.',
            validation_ajax: true,
            required: true
          },

          {
            block_type: 'physical_address',
            block_id: 2002,
  
            title: 'What’s the <strong>address</strong> for @this_employer_name?',
            required: true,
            validation_ajax: true,
            after_additional_response_skip_to_id: 3000
          }
    
        ]
      },

      {
        block_group_id: 903,
        title: '903',
        blocks: [ 
          {
            block_type: 'multiple_choice',
            block_id: 3000,
            required: false,
            title: 'Thanks.<br />Would you like to list <strong>another employer</strong>?',
            
            description: 'Please provide your <strong>last 2 years of employment history</strong>.',
      
            choices: [
              {
                keyboard: 'y',
                name: 'yes',
                text: 'Yes, list another employer',
                
                get_additional_response_group_id: 902,
                // Save the old responses from this group and repeat the group.
                // If multiple responses for the same block_id are submit them as:
                //   <input name="block_id[0]">
                //   ... where 0 is the iteration of the field. (0, 1, 2, 3, etc.)
                // This can be repeated as long as the user keeps clicking Yes.
                // After the additional responses are saved, skip back to this same question.
              },
              {
                keyboard: 'n',
                name: 'no',
                text: 'No more employers to list',
                skip_to_id: 3001
              },
            ]
          },
    
          {
            block_type: 'legal_agreement', // This is like 'statement' combined with 'multiple_choice', but it has multiple choice options
            block_id: 3001,
            required: true,
      
            title: 'We need your permission to conduct a background check.',
            description: 'Carefully review the terms below.',
            
            // One set of multiple choice questions is displayed right here -- between the title/description and the legalese.
            // And another set appears after the legalese.
            
            legalese: "<strong>DISCLOSURE TO CONSUMER</strong><br /><br /><strong>DISCLOSURE TO CONSUMER</strong><br /><br />As part of our hiring background and investigation process, we may obtain, where permitted, one or more reports and other information about you, including your background, employment history, academic and/or professional credentials, military service, credit history, and driving history. The information gathered also may involve a criminal history and/or alcohol or drug use history, if any. An investigative consumer report may include information about your character, general reputation, personal characteristics and mode of living that may be obtained by interviews with individuals with whom you are acquainted or who may have knowledge concerning any such items of information. This also may include contacts of all listed prior employers to verify your employment history. In addition, if your employment falls under the federal Department of Transportation (“DOT”) and the Federal Motor Carrier Safety Administration (“FMCSA”), including 49 CFR § 391.23, the report could include your driving, safety inspection and performance history from the FMCSA. Under the provisions of the Fair Credit Reporting Act (“FCRA”), 15 U.S.C. § 1681 et seq.; FMCSA regulations in the Federal Code of Regulations, including 49 CFR § 40.329; and certain state laws, before we can seek such reports, where permitted, we must have your written permission to obtain the information. You have the right, upon written request, to a complete and accurate disclosure of the nature and scope of the investigation. You also are entitled to a copy of that document entitled Rights Under the Fair Credit Reporting Act. Under the FCRA, before we take adverse action on the basis, in whole or in part, of information in a consumer report, you will be provided a copy of that report, the name, address, and telephone number of the consumer reporting agency, and a summary of your rights under the FCRA. Your information may be processed in a foreign country by persons providing services to our company and it may be accessible to law enforcement and national security authorities of that jurisdiction.<br /><br /><strong>AUTHORIZATION AND RELEASE TO OBTAIN INFORMATION</strong><br /><br />Under the Fair Credit Reporting Act (“FCRA”), 15 U.S.C. § 1681 et seq., the regulations applicable to the Federal Department of Transportation’s Federal Motor Carriers Safety Administration, including 49 CFR § 40.329, the Americans with Disabilities Act and all other applicable federal, state, and local laws, I hereby authorize and permit Acme, LLC to obtain information, where permitted, pertaining to my employment records, driving history records, driving performance and safety history, criminal history, credit history, civil records, workers’ compensation (post-offer only), alcohol and drug testing, verification of my academic and/or professional credentials, and information and/or copies of documents from any military service records.<br /><br />I understand that an “investigative consumer report” may result that could include information as to my character, general reputation, personal characteristics, and mode of living that may be obtained by interviews with individuals with whom I am acquainted or who may have knowledge concerning any such items of information. I specifically authorize the release of information by my former employers for the purpose of satisfying driver qualification regulations.<br /><br />By my signature below, I authorize the preparation of background reports about me, including background reports that are “investigative consumer reports” by HireRight, and to the furnishing of such background reports to Acme and its designated representatives and agents, for the purpose of assisting the Acme in making a determination as to my eligibility for employment, promotion, retention or for other lawful employment purposes. I understand that if the Acme hires me or contracts for my services, my consent will apply, and Acme may, as allowed by law, obtain from HireRight (or from a consumer reporting agency other than HireRight) additional background reports pertaining to me, without asking for my authorization again, throughout my employment period. I understand that if Acme obtains a credit report about me, then it will only do so where such information is substantially related to the duties and responsibilities of the position in which I am engaged or for which I am being evaluated. I understand that information contained in my employment application, or otherwise disclosed by me before or during my employment, if any, may be used for the purpose of obtaining and evaluating background reports on me. I also understand that nothing herein shall be construed as an offer of employment or contract for services. I understand that the information included in the background reports may be obtained from private and public record sources, including without limitation and as appropriate: government agencies and courthouses; educational institutions; and employers. Accordingly, I hereby authorize all of the following, to disclose information about me to the consumer reporting agency and its agents: law enforcement and all other federal, state and local government agencies and courts; educational institutions (public or private); testing agencies; information service bureaus; credit bureaus and other consumer reporting agencies; other public and private record/data repositories; motor vehicle records agencies; my employers; the military; and all other individuals and sources with any information about or concerning me. The information that can be disclosed to the consumer reporting agency and its agents includes, but is not limited to, information concerning my: employment and earnings history; education, credit, motor vehicle and accident history; drug/alcohol testing results and history; criminal history; litigation history; military service; professional licenses, credentials and certifications; social security number verification; address and alias history; and other information. By my signature below, I also promise that the personal information I provide with this form or otherwise in connection with my background investigation is true, accurate and complete, and I understand that dishonesty or material omission may disqualify me from consideration for employment. I agree that a copy of this document in faxed, photocopied or electronic (including electronically signed) form will be valid like the signed original.<br /><br />I understand and acknowledge that this release of information may assist my prospective employer to make a determination regarding my suitability as an employee. I further understand that under the FCRA, I may request a copy of any consumer report from the consumer reporting agency that compiled the report, after I have provided proper identification.",
      
            choices: [
              {
                keyboard: 'a',
                name: 'agree',
                text: 'I Agree',
                
                skip_to_id: 3002
              },
              {
                keyboard: 'd',
                name: 'disagree',
                text: 'I Disagree',
                submit_form: true
              }
            ]
          },
          
          {
            block_type: 'signature',
            block_id: 3002,
            required: true,
            
            title: 'If you agree with these terms, please <strong>type your full name</strong> below.',
            // Desktop users type their name into a text field just like 'short_text'.
            
            title_touch: 'If you agree with these terms, please <strong>sign your name</strong>.',
            button_touch: 'Tap to Sign',
            submit_form: true
            // This button appears on touch devices only.
            // Instead of giving a field to type their name, give a button.
            // When the button is pressed, a nearly full screen signature_pad appears with title_touch displayed in small print at the top.
            
            // This is the last question.
            // The form submits after this is complete.
          }
    
        ]
      },
    ]
  };