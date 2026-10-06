# Graph Report - Python_Book_Website  (2026-10-06)

## Corpus Check
- 87 files · ~370,651 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 359 nodes · 495 edges · 32 communities (30 shown, 2 thin omitted)
- Extraction: 86% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.81)
- Token cost: 255,877 input · 0 output

## Community Hubs (Navigation)
- Class vs Procedural Figure
- Exception Handling (Ch7)
- OOP Pillars Figure
- Unit Testing (Ch9)
- Iterator & Decorator Figures
- Iterators Generators Decorators (Ch6)
- Site Build Script
- RegEx (Ch10)
- Student Result App Screens
- File Operation (Ch2) & Build Pipeline
- Packages & Software Types Figure
- Class-Object Diagram
- Website Features & Deploy
- OOP Basics (Ch4)
- Logging (Ch8)
- File & Logging Flow Figures
- Board Questions (Ch12)
- Python Functions (Ch1)
- Control Flow Figures
- Modules & Packages (Ch3)
- Four Pillars of OOP (Ch5)
- Book Cover & Branding
- Iterator Protocol Figure
- Application Pipeline
- Decorator Flow Figure
- Feedback Forms & Web3Forms
- Inheritance Types Figure
- Try Except Blocks
- Program Execution Figure
- Multiple Inheritance Example
- Try Flowchart

## God Nodes (most connected - your core abstractions)
1. `Chapter 6: Python Iterator, Generator and Decorators` - 20 edges
2. `Chapter 5: Four Pillars of OOP` - 17 edges
3. `Chapter 10: Python RegEx (Regular Expression)` - 17 edges
4. `Chapter 8: Logging in Python` - 15 edges
5. `Chapter 11: Application Software` - 15 edges
6. `Chapter 4: Basics of OOP` - 14 edges
7. `Chapter 7: Exception and Error Handling in Python` - 14 edges
8. `Chapter 1: Python Functions` - 12 edges
9. `Chapter 2: File Operation in Python` - 11 edges
10. `Chapter 9: Unit Testing in Python` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Unit 7: Exception & Error Handling (p.176)` --semantically_similar_to--> `Chapter 7: Exception and Error Handling in Python`  [INFERRED] [semantically similar]
  site/downloads/Application_Development_Using_Python.pdf → site/chapters/ch07.html
- `Unit 8: Logging in Python (p.198)` --semantically_similar_to--> `Chapter 8: Logging in Python`  [INFERRED] [semantically similar]
  site/downloads/Application_Development_Using_Python.pdf → site/chapters/ch08.html
- `Unit 10: Python RegEx (p.232)` --semantically_similar_to--> `Chapter 10: Python RegEx (Regular Expression)`  [INFERRED] [semantically similar]
  site/downloads/Application_Development_Using_Python.pdf → site/chapters/ch10.html
- `Unit 11: Application Software (p.251)` --semantically_similar_to--> `Chapter 11: Application Software`  [INFERRED] [semantically similar]
  site/downloads/Application_Development_Using_Python.pdf → site/chapters/ch11.html
- `Unit 9: Unit Testing (p.215)` --semantically_similar_to--> `Chapter 9: Unit Testing in Python`  [INFERRED] [semantically similar]
  site/downloads/Application_Development_Using_Python.pdf → site/chapters/ch09.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Four Pillars of OOP** — site_chapters_ch05_inheritance, site_chapters_ch05_encapsulation, site_chapters_ch05_polymorphism, site_chapters_ch05_abstraction [EXTRACTED 1.00]
- **Decorator Build-up Steps** — site_chapters_ch06_function_as_object, site_chapters_ch06_nested_function, site_chapters_ch06_decorator, site_chapters_ch06_at_syntax [EXTRACTED 1.00]
- **Feedback-to-Email Pipeline** — site_feedback_review_form, site_assets_app, readme_config_js, readme_web3forms [INFERRED 0.85]
- **SRMS project integrates RegEx, custom exceptions and logging** — site_chapters_ch11_srms_project, site_chapters_ch11_validators_py, site_chapters_ch11_storage_py, site_chapters_ch10_re_compile, site_chapters_ch07_custom_exception_class, site_chapters_ch08_logging_module [EXTRACTED 1.00]
- **Logger-Handler-Formatter logging pipeline** — site_chapters_ch08_getlogger, site_chapters_ch08_filehandler, site_chapters_ch08_streamhandler, site_chapters_ch08_formatter [EXTRACTED 1.00]
- **try/except/else/finally exception handling flow** — site_chapters_ch07_try_except_block, site_chapters_ch07_multiple_except_as, site_chapters_ch07_else_finally_clause, site_chapters_ch07_raise_statement [EXTRACTED 1.00]
- **Application Input-Validation-Processing-Storage-Output Pipeline** — site_img_appfunc_input, site_img_appfunc_validation, site_img_appfunc_processing, site_img_appfunc_storage, site_img_appfunc_output [EXTRACTED 1.00]
- **Iterator protocol: iter() then repeated next() until StopIteration** — site_img_iter_iterable, site_img_iter_iterator, site_img_iter_value_10, site_img_iter_value_20, site_img_iter_value_30, site_img_iter_stopiteration [EXTRACTED 1.00]
- **Python logging pipeline: Logger, Handler, Formatter to outputs** — site_img_logflow_warning_call, site_img_logflow_logger, site_img_logflow_handler, site_img_logflow_formatter, site_img_logflow_console, site_img_logflow_file_app_log [EXTRACTED 1.00]
- **Four pillars of OOP built on Class and Object** — site_img_pillars_encapsulation, site_img_pillars_abstraction, site_img_pillars_inheritance, site_img_pillars_polymorphism, site_img_pillars_class_and_object [EXTRACTED 1.00]
- **Student Result Management Flask app pages** — site_img_shot_dashboard_dashboard_page, site_img_shot_add_error_add_student_page, site_img_shot_search_search_page, site_img_shot_dashboard_student_result_management [EXTRACTED 1.00]
- **try/except/else/finally construct** — site_img_tryflow_try_block, site_img_tryflow_except_block, site_img_tryflow_else_block, site_img_tryflow_finally_block [EXTRACTED 1.00]
- **Student class instantiated into s1, s2, s3** — tools_source_img_p2_class_student, tools_source_img_p2_object_s1, tools_source_img_p2_object_s2, tools_source_img_p2_object_s3 [EXTRACTED 1.00]
- **Four pillars of OOP** — tools_source_img_p3_encapsulation, tools_source_img_p3_abstraction, tools_source_img_p3_inheritance, tools_source_img_p3_polymorphism [EXTRACTED 1.00]
- **try/except/else/finally exception handling flow** — tools_source_img_p6_try_block, tools_source_img_p6_except_block, tools_source_img_p6_else_block, tools_source_img_p6_finally_block [EXTRACTED 1.00]

## Communities (32 total, 2 thin omitted)

### Community 0 - "Class vs Procedural Figure"
Cohesion: 0.10
Nodes (26): p2.png - Class/Object and Procedural vs OOP diagram, class Student (blueprint), Object instantiation from class, Student object s1 (Rahim), Student object s2 (Sumaiya), Student object s3 (Karim), OOP (data and functions together), Procedural programming (data and functions separate) (+18 more)

### Community 1 - "Exception Handling (Ch7)"
Cohesion: 0.13
Nodes (24): Built-in Exceptions, Chapter 7: Exception and Error Handling in Python, else and finally Clauses, Exception Hierarchy, InsufficientBalanceError, InvalidMarksError, Multiple except and as, raise Statement (+16 more)

### Community 2 - "OOP Pillars Figure"
Cohesion: 0.10
Nodes (23): Abstraction (hide complexity, show only needed parts), Class and Object (foundation of OOP), Encapsulation (hide data, keep it safe), pillars.png (OOP Four Pillars diagram), Inheritance (take properties from an existing class), Object Oriented Programming, Polymorphism (one name, different behavior), pkg.png (Python package structure diagram) (+15 more)

### Community 3 - "Unit Testing (Ch9)"
Cohesion: 0.11
Nodes (20): Exception (concept), Assertion Methods (assertEqual, assertRaises, assertAlmostEqual), Chapter 9: Unit Testing in Python, Chapter 9 Board Questions & Answers, setUp() and unittest.main(), Structure of a Unit Test, unittest.TestCase, Unit Testing (concept) (+12 more)

### Community 4 - "Iterator & Decorator Figures"
Cohesion: 0.12
Nodes (19): p4.png - Iterator protocol and decorator wrapper diagram, Decorator wrapper function, Iterable [10, 20, 30], Iterator (via iter()), next() call, say_hello() decorated function, StopIteration, p6.png - Exception handling flow and logging pipeline diagram (+11 more)

### Community 5 - "Iterators Generators Decorators (Ch6)"
Cohesion: 0.14
Nodes (17): with Statement, ABC and abstractmethod, Getter and Setter, @ Decorator Syntax, Chapter 6 Board Exam Questions & Answers, Custom Iterator (__iter__/__next__), Decorator, Fibonacci Generator (+9 more)

### Community 6 - "Site Build Script"
Cohesion: 0.33
Nodes (10): code_html(), esc(), inline(), inline_code(), items_html(), output_html(), page_chapter(), page_feedback() (+2 more)

### Community 7 - "RegEx (Ch10)"
Cohesion: 0.22
Nodes (15): Chapter 10: Python RegEx (Regular Expression), Chapter 10 Board Questions & Answers, Metacharacters and Special Sequences, re.compile, re.findall, re.finditer, re.match / re.fullmatch, re Module Built-in Methods (+7 more)

### Community 8 - "Student Result App Screens"
Cohesion: 0.14
Nodes (15): Add Student page (Roll, Name, Department, Phone, Marks form), shot_add_error.png (Add Student form with validation errors), Regex form validation (6-digit roll, letters-only name 3-40, BD phone 01XXXXXXXXX), Flask web framework, Student Result Management app (Python + Flask, MIU branding), Case-insensitive RegEx search, shot_search.png (Student search page), Search page (find by name or roll, highlighted matches) (+7 more)

### Community 9 - "File Operation (Ch2) & Build Pipeline"
Cohesion: 0.16
Nodes (13): tools/build_site.py Site Generator, tools/source/final_XX.json Chapter Content, Chapter 2 Board Exam Questions & Answers, Chapter 2 Rating & Feedback Form, File Opening Modes, Chapter 2: File Operation in Python, File Read/Write Functions, File Types (+5 more)

### Community 10 - "Packages & Software Types Figure"
Cohesion: 0.17
Nodes (13): p5.png - Python package structure and software classification diagram, Application Software, Custom / Tailor-made software, General Purpose software (Word, Excel, Browser), __init__.py (package marker), main.py, project/ directory, result.py module (+5 more)

### Community 11 - "Class-Object Diagram"
Cohesion: 0.18
Nodes (10): classobj.png - Class vs Object Diagram, Object Instantiation (object তৈরি), s1 (Rahim, 101, 3.75), s2 (Sumaiya, 102, 3.90), s3 (Karim, 103, 3.20), class Student (blueprint: name, roll, cgpa; show(), is_passed()), DiplomaStudent, Person (+2 more)

### Community 12 - "Website Features & Deploy"
Cohesion: 0.25
Nodes (10): assets/config.js Access Key, Code Copy Button, Dark Mode Toggle, GitHub Pages Deployment, Netlify Drop Deployment, Python Book Website (README), Reading Progress & Completed Chapter Marks, Vercel Deployment (+2 more)

### Community 13 - "OOP Basics (Ch4)"
Cohesion: 0.18
Nodes (11): Chapter 4: Basics of OOP, Chapter 4 Board Exam Questions & Answers, Class, Constructor __init__(), Instance vs Class Attribute, Method, Object, Procedural vs OOP (+3 more)

### Community 14 - "Logging (Ch8)"
Cohesion: 0.29
Nodes (11): logging.basicConfig, Chapter 8: Logging in Python, Chapter 8 Board Questions & Answers, logging.FileHandler, Log Format Attributes, logging.Formatter, logging.getLogger, Logging Levels (DEBUG, INFO, WARNING, ERROR, CRITICAL) (+3 more)

### Community 15 - "File & Logging Flow Figures"
Cohesion: 0.27
Nodes (11): fileops.png - File Operation Steps, 3. Close: close(), 1. Open: open("file.txt", mode), 2. Read/Write: read(), write(), logflow.png - Logging Flow, Console, File (app.log), Formatter (how it looks) (+3 more)

### Community 16 - "Board Questions (Ch12)"
Cohesion: 0.22
Nodes (10): Chapter 7 Board Questions & Answers, Chapter 12: Previous Board Questions and Suggestions, Final Exam 2022, Final Exam 2023, Final Exam 2025, Question Analysis, Suggestion Questions Set 1, Suggestion Questions Set 2 (+2 more)

### Community 17 - "Python Functions (Ch1)"
Cohesion: 0.22
Nodes (9): Chapter 1 Board Exam Questions & Answers, Date and Time Functions, Function, Function Arguments, Pass by Value vs Pass by Reference, Chapter 1: Python Functions, User-defined Function, Method Overloading vs Overriding (+1 more)

### Community 18 - "Control Flow Figures"
Cohesion: 0.22
Nodes (9): preview.png - Combined preview of if-elif grading and while loop flowcharts, Grading if/elif/else chain (marks >= 80/60/40), Grades A+, A, B, F, While loop countdown flow (count > 0), while.png - While loop flowchart, Loop body: print(count); count = count - 1, Loop condition count > 0, Loop end, go to next line (+1 more)

### Community 19 - "Modules & Packages (Ch3)"
Cohesion: 0.25
Nodes (8): Library Function, Application Software, Chapter 3 Board Exam Questions & Answers, Chapter 3 Rating & Feedback Form, Four Forms of import, Module, Chapter 3: Module, Package and Application Software, Package

### Community 20 - "Four Pillars of OOP (Ch5)"
Cohesion: 0.36
Nodes (8): Object Oriented Programming, Abstraction, Access Modifiers (Public/Protected/Private), Chapter 5 Board Exam Questions & Answers, Encapsulation, Chapter 5: Four Pillars of OOP, Method Overriding, Polymorphism

### Community 21 - "Book Cover & Branding"
Cohesion: 0.29
Nodes (8): cover.png - Book Cover, Polytechnic Students (target audience), Kazi Tauhid Rana (CST, Rajshahi Polytechnic Institute), Application Development Using Python (1st Edition, subject code 28536), MIU Platform, favicon.png - MIU Favicon, logo.png - MIU Logo (Learn Grow Succeed), MIU Brand (Learn Grow Succeed)

### Community 22 - "Iterator Protocol Figure"
Cohesion: 0.38
Nodes (7): iter.png - Iterator Protocol Flow, [10, 20, 30] (iterable), iterator (via iter()), StopIteration, 10, 20, 30

### Community 23 - "Application Pipeline"
Cohesion: 0.60
Nodes (6): appfunc.png - Application Pipeline Diagram, Input (ইনপুট গ্রহণ), Output (ফলাফল ও রিপোর্ট), Processing (হিসাব ও প্রক্রিয়া), Storage (সংরক্ষণ), Validation (যাচাই)

### Community 24 - "Decorator Flow Figure"
Cohesion: 0.47
Nodes (6): deco.png - Decorator Wrapper Flow, print("After") - post-call work, print("Before") - pre-call work, Decorator Wrapper (returned by decorator), Original say_hello() print("Hello!"), say_hello() call

### Community 25 - "Feedback Forms & Web3Forms"
Cohesion: 0.40
Nodes (5): Web3Forms Email Integration, Chapter 1 Rating & Feedback Form, Chapter 4 Rating & Feedback Form, Chapter 5 Rating & Feedback Form, Chapter 6 Rating & Feedback Form

### Community 26 - "Inheritance Types Figure"
Cohesion: 0.40
Nodes (5): inherit.png - Types of Inheritance, Hierarchical Inheritance (Student, Teacher -> Person), Multilevel Inheritance (DiplomaStudent -> Student -> Person), Multiple Inheritance (SmartPhone -> Phone, Camera), Single Inheritance (Student -> Person)

### Community 27 - "Try Except Blocks"
Cohesion: 0.67
Nodes (4): else block (runs when no exception), except block (matching exception), finally block (always runs), try block

### Community 28 - "Program Execution Figure"
Cohesion: 0.50
Nodes (4): run.png - How a Python program runs diagram, hello.py (your source code), Output (result on screen), Python Interpreter (reads line by line)

### Community 29 - "Multiple Inheritance Example"
Cohesion: 0.67
Nodes (3): Camera, Phone, SmartPhone

## Ambiguous Edges - Review These
- `Dashboard page (stat cards: total/passed/failed/top scorer + results table)` → `Grading decision chain (marks >=80 A+, >=60 A, >=40 B, else F)`  [AMBIGUOUS]
  site/img/shot_dashboard.png · relation: conceptually_related_to
- `class Student (blueprint)` → `student.py module`  [AMBIGUOUS]
  tools/source/img/p5.png · relation: conceptually_related_to

## Knowledge Gaps
- **110 isolated node(s):** `Netlify Drop Deployment`, `Vercel Deployment`, `GitHub Pages Deployment`, `Application Development Using Python (Book)`, `Chapter 1 Board Exam Questions & Answers` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 120 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Dashboard page (stat cards: total/passed/failed/top scorer + results table)` and `Grading decision chain (marks >=80 A+, >=60 A, >=40 B, else F)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Table of Contents` connect `Unit Testing (Ch9)` to `Board Questions (Ch12)`, `Exception Handling (Ch7)`, `Logging (Ch8)`, `RegEx (Ch10)`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Chapter 5: Four Pillars of OOP` (e.g. with `tools/source/final_XX.json Chapter Content` and `Object Oriented Programming`) actually correct?**
  _`Chapter 5: Four Pillars of OOP` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Netlify Drop Deployment`, `Vercel Deployment`, `GitHub Pages Deployment` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Class vs Procedural Figure` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._
- **What is the exact relationship between `class Student (blueprint)` and `student.py module`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Chapter 6: Python Iterator, Generator and Decorators` connect `Iterators Generators Decorators (Ch6)` to `File Operation (Ch2) & Build Pipeline`, `Website Features & Deploy`, `Feedback Forms & Web3Forms`, `Python Functions (Ch1)`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._