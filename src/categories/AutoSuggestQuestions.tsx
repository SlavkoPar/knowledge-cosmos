import React, { JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from 'common/utilities'
import './AutoSuggestQuestions.css'
import { IQuest, IQuestionKey } from 'categories/types';
import { ICat } from 'global/types';


interface ICatMy {
	id: string,
	parentCategoryUp: string,
	categoryParentTitle: string,
	categoryTitle: string,
	quests: IQuest[]
}

interface ICatSection {
	categoryId: string,
	categoryTitle: string,
	parentCategoryUp: string,
	categoryParentTitle: string, // TODO ???
	quests: IQuest[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();
interface ICatIdTitle {
	id: string;
	title: string;
}

const QuestionAutosuggestMulti = Autosuggest as { new(): Autosuggest<IQuest, ICatMy> };

export class AutoSuggestQuestions extends React.Component<{
	tekst: string | undefined,
	onSelectQuestion: (questionKey: IQuestionKey) => void,
	allCategories: Map<string, ICat>,
	execute: (method: string, endpoint: string) => Promise<any>,
	searchQuestions: (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number) => Promise<IQuest[]>
}, any> {
	// region Fields
	state: any;
	isMob: boolean;
	allCategories: Map<string, ICat>;
	execute: (method: string, endpoint: string) => Promise<any>;
	searchQuestions: (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number) => Promise<IQuest[]>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		console.log("CONSTRUCTOR")
		super(props);
		this.state = {
			value: props.tekst || '',
			suggestions: [], //this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.allCategories = props.allCategories;
		this.execute = props.execute;
		this.searchQuestions = props.searchQuestions;
		this.isMob = isMobile;
		this.loadSuggestions = this.loadSuggestions.bind(this);
		this.debouncedLoadSuggestions = debounce(this.loadSuggestions, 300);
	}

	async loadSuggestions(value: string) {
		this.setState({
			isLoading: true
		});

		console.time();
		const suggestions = await this.getSuggestions(value);
		console.timeEnd();

		if (value === this.state.value) {
			this.setState({
				isLoading: false,
				suggestions,
				noSuggestions: suggestions.length === 0
			});
		}
		else { // Ignore suggestions if input value changed
			this.setState({
				isLoading: false
			});
		}
	}

	componentDidMount() {
		setTimeout(() => {
			window.focus()
			// inputAutosuggest!.current!.focus();
		}, 300)
	}

	// endregion region Rendering methods
	render(): JSX.Element {
		const { value, suggestions, noSuggestions } = this.state;

		return <div>
			<QuestionAutosuggestMulti
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}  // (sl) added
				multiSection={true}
				suggestions={suggestions}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
				onSuggestionSelected={this.onSuggestionSelected.bind(this)}
				getSuggestionValue={this.getSuggestionValue}
				renderSuggestion={this.renderSuggestion}
				renderSectionTitle={this.renderSectionTitle}
				getSectionSuggestions={this.getSectionSuggestions}
				// onSuggestionHighlighted={this.onSuggestionHighlighted} (sl)
				onSuggestionHighlighted={this.onSuggestionHighlighted.bind(this)}
				highlightFirstSuggestion={false}
				renderInputComponent={this.renderInputComponent}
				// renderSuggestionsContainer={this.renderSuggestionsContainer}
				focusInputOnSuggestionClick={!this.isMob}
				inputProps={{
					placeholder: `Type 'daljinski'`,
					value,
					onChange: (e, changeEvent) => this.onChange(e, changeEvent),
					autoFocus: true
				}}
			/>
			{noSuggestions &&
				<div className="no-suggestions">
					No questions to suggest
				</div>
			}
		</div>
	}


	private satisfyingCategories = (searchWords: string[]): ICatIdTitle[] => {
		const arr: ICatIdTitle[] = [];
		searchWords.filter(w => w.length >= 3).forEach(w => {
			this.allCategories.forEach(async cat => {
				const parentCategory = cat.id;
				let j = 0;
				// cat.words.forEach(catw => {
				// 	if (catw.includes(w)) {
				// 		console.log("Add all questions of category")
				// 		arr.push({ id: cat.id, title: cat.title })
				// 	}
				// })
			})
		})
		return arr;
	}

	protected async getSuggestions(search: string): Promise<ICatSection[]> {
		const escapedValue = escapeRegexCharacters(search.trim());
		if (escapedValue === '') {
			return [];
		}
		if (search.length < 2)
			return [];

		const catQuests = new Map<string, IQuest[]>();

		const questionKeys: IQuestionKey[] = [];
		try {
			console.log('--------->>>>> getSuggestions')
			var questDtoList: IQuest[] = await this.searchQuestions(this.execute, escapedValue, 18);

			questDtoList.forEach((quest: IQuest) => {
				const { id, parentCategory, title } = quest;
				const questionKey = { parentCategory, id }
				if (!questionKeys.includes(questionKey)) {
					questionKeys.push(questionKey);

					// 2) Group questions by parentCategory
					const quest: IQuest = {
						id,
						parentCategory,
						title,
						categoryTitle: ''
					}
					if (!catQuests.has(parentCategory)) {
						catQuests.set(parentCategory, [quest]);
					}
					else {
						catQuests.get(parentCategory)!.push(quest);
					}
				}
			})
		}
		catch (error: any) {
			console.debug(error)
		};

		////////////////////////////////////////////////////////////////////////////////
		// Search for Categories title words, and add all the questions of the Category
		/*
		if (questionKeys.length === 0) {
			try {
				const tx = this.dbp!.transaction('Questions')
				const index = tx.store.index('parentCategory_idx');
				const catIdTitles = this.satisfyingCategories(searchWords)
				let i = 0;
				while (i < catIdTitles.length) {
					const catIdTitle = catIdTitles[i];
					const parentCategory = catIdTitle.id;
					for await (const cursor of index.iterate(parentCategory)) {
						const q: IQuestion = cursor.value;
						const { id, title } = q;
						//if (!questionRows.includes(id!))
						//	questionRows.push(id!);

						const questionKey = { parentCategory, id }
						if (!questionKeys.includes(questionKey)) {
							questionKeys.push(questionKey);

							//console.log(q);
							// 2) Group questions by parentCategory
							const quest: IQuest = {
								id,
								parentCategory,
								title,
								categoryTitle: catIdTitle.title
							}
							if (!catQuests.has(parentCategory)) {
								catQuests.set(parentCategory, [quest]);
							}
							else {
								catQuests.get(parentCategory)!.push(quest);
							}
						}
					}
					await tx.done;
				}
			}
			catch (error: any) {
				console.debug(error)
			};
		}
		await tx.done;
		*/

		if (questionKeys.length === 0)
			return [];

		try {
			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IQuestionRow[2]}
			// 1 = {'EDGE2' => IQuestionRow[3]}
			// 2 = {'EDGE3' => IQuestionRow[4]}

			////////////////////////////////////////////////////////////
			// 
			let catSections: ICatSection[] = [];
			catQuests.forEach((quests, categoryId) => {
				const cat = this.allCategories.get(categoryId);
				const { title, titlesUpTheTree, variations } = cat!;
				//console.log(`${categoryId} = ${quests}`);
				const catSection: ICatSection = {
					categoryId,
					categoryTitle: title,
					categoryParentTitle: 'kuro',
					parentCategoryUp: titlesUpTheTree!,
					quests: []
				};
				quests.forEach(quest => {
					// console.log(quest);
					if (variations.length > 0) {
						let wordsIncludesTag = false;
						// searchWords.forEach(w => {
						// 	variations.forEach(variation => {
						// 		if (variation === w.toUpperCase()) {
						// 			wordsIncludesTag = true;
						// 			catSection.quests.push({ ...quest, title: quest.title + ' ' + variation });
						// 		}
						// 	})
						// })
						if (!wordsIncludesTag) {
							variations.forEach(variation => {
								// console.log(quest);
								catSection.quests.push({ ...quest, title: quest.title + ' ' + variation });
							});
						}
					}
					else {
						catSection.quests.push(quest);
					}
				});
				catSections.push(catSection);
				//console.log(catSections)
			});
			return catSections;
		}
		catch (error: any) {
			console.log(error)
		};
		return [];
	}


	protected onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: [],
			noSuggestions: false
		});
	};

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IQuest>): void {
		const question: IQuest = data.suggestion;
		// alert(`Selected question is ${question.questionId} (${question.text}).`);
		this.props.onSelectQuestion({ parentCategory: question.parentCategory, id: question.id });
	}

	/*
	protected renderSuggestion(suggestion: Question, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

	// TODO bac ovo u external css   style={{ textAlign: 'left'}}
	protected renderSuggestion(suggestion: IQuest, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		// const className = params.isHighlighted ? "highlighted" : undefined;
		//return <span className={className}>{suggestion.name}</span>;
		const matches = AutosuggestHighlightMatch(suggestion.title, params.query);
		const parts = AutosuggestHighlightParse(suggestion.title, matches);
		return (
			<span style={{ textAlign: 'left' }}>
				{parts.map((part, index) => {
					const className = part.highlight ? 'react-autosuggest__suggestion-match' : undefined;
					return (
						<span className={className} key={index}>
							{part.text}
						</span>
					);
				})}
			</span>
		);
	}

	protected renderSectionTitle(section: ICatMy): JSX.Element {
		const { parentCategoryUp, categoryParentTitle, categoryTitle } = section;
		// let str = (categoryParentTitle ? (categoryParentTitle + " / ") : "") + categoryTitle;
		// if (parentCategoryUp)
		// 	str = " ... / " + str;
		return <strong>
			{parentCategoryUp}
		</strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IQuestionShort>): JSX.Element {
	// 	 const { onChange, onBlur, ...restInputProps } = inputProps;
	// 	 return (
	// 		  <div>
	// 				<input {...restInputProps} />
	// 		  </div>
	// 	 );
	// }

	protected renderInputComponent(inputProps: Autosuggest.RenderInputComponentProps): JSX.Element {
		const { ref, ...restInputProps } = inputProps;
		// if (ref !== undefined)
		// 	this.inputAutosuggest = ref as React.RefObject<HTMLInputElement>;

		return (
			<div>
				{/* <input {...restInputProps} ref={inputAutosuggest} /> */}
				<input ref={ref} autoFocus {...restInputProps} />
			</div>
		);
	}

	// const Input = forwardRef<HTMLInputElement, Omit<InputProps, "ref">>(
	// 	(props: Omit<InputProps, "ref">, ref): JSX.Element => (
	// 	  <input {...props} ref={ref} />
	// 	)
	//   );

	// protected renderSuggestionsContainer({ containerProps, children, query }:
	// 	Autosuggest.RenderSuggestionsContainerParams): JSX.Element {
	// 	return (
	// 		<div {...containerProps}>
	// 			<span>{children}</span>
	// 		</div>
	// 	);
	// }
	// endregion region Event handlers

	protected onChange(event: /*React.ChangeEvent<HTMLInputElement>*/ React.FormEvent<any>, { newValue, method }: Autosuggest.ChangeEvent): void {
		this.setState({ value: newValue });
	}

	// getParentTitle = async (id: string): Promise<any> => {
	// 	let category = await this.dbp.get('Categories', id);
	// 	return { parentCategoryTitle: category.title, parentCategoryUp: '' };
	// }

	protected async onSuggestionsFetchRequested({ value }: any): Promise<void> {
		return /*await*/ this.debouncedLoadSuggestions(value);
	}

	private anyWord = (valueWordRegex: RegExp[], questionWords: string[]): boolean => {
		for (let valWordRegex of valueWordRegex)
			for (let questionWord of questionWords)
				if (valWordRegex.test(questionWord))
					return true;
		return false;
	}

	////////////////////////////////////
	// endregion region Helper methods

	protected getSuggestionValue(suggestion: IQuest) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: ICatMy) {
		return section.quests;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}