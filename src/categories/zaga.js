/* ---------- */
/*    Data    */
/* ---------- */

const languages = [
   {
     name: 'C',
     year: 1972
   },
   {
     name: 'C#',
     year: 2000
   },
   {
     name: 'C++',
     year: 1983
   },
   {
     name: 'Clojure',
     year: 2007
   },
   {
     name: 'Elm',
     year: 2012
   },
   {
     name: 'Go',
     year: 2009
   },
   {
     name: 'Haskell',
     year: 1990
   },
   {
     name: 'Java',
     year: 1995
   },
   {
     name: 'Javascript',
     year: 1995
   },
   {
     name: 'Perl',
     year: 1987
   },
   {
     name: 'PHP',
     year: 1995
   },
   {
     name: 'Python',
     year: 1991
   },
   {
     name: 'Ruby',
     year: 1995
   },
   {
     name: 'Scala',
     year: 2003
   }
 ];
 
 function getMatchingLanguages(value) {
   const escapedValue = escapeRegexCharacters(value.trim());
   if (escapedValue === '') {
     return [];
   }
   
   const regex = new RegExp('^' + escapedValue, 'i');
   return languages.filter(language => regex.test(language.name));
 }
 
 /* ----------- */
 /*    Utils    */
 /* ----------- */
 
 // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
 function escapeRegexCharacters(str) {
   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 }
 
 function randomDelay() {
   return 300 + Math.random() * 1000;
 }
 
 /* --------------- */
 /*    Component    */
 /* --------------- */
 
 function getSuggestionValue(suggestion) {
   return suggestion.name;
 }
 
 function renderSuggestion(suggestion) {
   return (
     <span>{suggestion.name}</span>
   );
 }
 
 class App extends React.Component {
   constructor() {
     super();
 
     this.state = {
       value: '',
       suggestions: [],
       isLoading: false
     };
 
     this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 1000); // 1000ms is chosen for demo purposes only.
   }
   
   loadSuggestions(value) {
     this.setState({
       isLoading: true
     });
     
     // Fake an AJAX call
     setTimeout(() => {
       const suggestions = getMatchingLanguages(value);
 
       if (value === this.state.value) {
         this.setState({
           isLoading: false,
           suggestions
         });
       } else { // Ignore suggestions if input value changed
         this.setState({
           isLoading: false
         });
       }
     }, randomDelay());
   }
   
   onChange = (event, { newValue }) => {
     this.setState({
       value: newValue
     });
   };
   
   onSuggestionsFetchRequested = ({ value }) => {
     this.debouncedLoadSuggestions(value);
   };
 
   onSuggestionsClearRequested = () => {
     this.setState({
       suggestions: []
     });
   };
 
   render() {
     const { value, suggestions, isLoading } = this.state;
     const inputProps = {
       placeholder: "Type 'c'",
       value,
       onChange: this.onChange
     };
     const status = (isLoading ? 'Loading...' : 'Type to load suggestions');
 
     return (
       <div>
         <div className="status">
           <strong>Status:</strong> {status}
         </div>
         <Autosuggest 
           suggestions={suggestions}
           onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
           onSuggestionsClearRequested={this.onSuggestionsClearRequested}
           getSuggestionValue={getSuggestionValue}
           renderSuggestion={renderSuggestion}
           inputProps={inputProps} />
       </div>
     );
   }
 }
 
 ReactDOM.render(<App />, document.getElementById('app'));
 