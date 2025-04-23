import React, { JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from 'common/utilities'
import './AutoSuggestAnswers.css'
import { IAns, IAnswerKey } from 'groups/types';
import { IShortGroup } from 'global/types';


interface IGrpMy {
	id: string,
	parentGroupUp: string,
	groupParentTitle: string,
	groupTitle: string,
	anss: IAns[]
}

interface IGroupSection	 {
	id: string,
	groupTitle: string,
	parentGroupUp: string,
	groupParentTitle: string, // TODO ???
	anss: IAns[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();
interface IShortGroupIdTitle {
	id: string;
	title: string;
}

const AnswerAutosuggestMulti = Autosuggest as { new(): Autosuggest<IAns, IGrpMy> };

export class AutoSuggestAnswers extends React.Component<{
	tekst: string | undefined,
	onSelectAnswer: (answerKey: IAnswerKey) => void,
	allGroups: Map<string, IShortGroup>,
	searchAnswers: (filter: string, count: number) => Promise<IAns[]>
}, any> {
	// region Fields
	state: any;
	isMob: boolean;
	allGroups: Map<string, IShortGroup>;
	searchAnswers: (filter: string, count: number) => Promise<IAns[]>;
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
		this.allGroups = props.allGroups;
		this.searchAnswers = props.searchAnswers;
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
			<AnswerAutosuggestMulti
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
					No answers to suggest
				</div>
			}
		</div>
	}


	private satisfyingGroups = (searchWords: string[]): IShortGroupIdTitle[] => {
		const arr: IShortGroupIdTitle[] = [];
		searchWords.filter(w => w.length >= 3).forEach(w => {
			this.allGroups.forEach(async group => {
				const parentGroup = group.groupKey.id;
				let j = 0;
				// grp.words.forEach(grpw => {
				// 	if (grpw.includes(w)) {
				// 		console.log("Add all answers of group")
				// 		arr.push({ id: grp.id, title: grp.title })
				// 	}
				// })
			})
		})
		return arr;
	}

	protected async getSuggestions(search: string): Promise<IGroupSection[]> {
		const escapedValue = escapeRegexCharacters(search.trim());
		if (escapedValue === '') {
			return [];
		}
		if (search.length < 2)
			return [];

		const grouppAnswers = new Map<string, IAns[]>();

		const answerKeys: IAnswerKey[] = [];
		try {
			console.log('--------->>>>> getSuggestions')
			var ansDtoList: IAns[] = await this.searchAnswers(escapedValue, 20);

			ansDtoList.forEach((ans: IAns) => {
				const { id, partitionKey, parentGroup, title } = ans;
				const answerKey = { partitionKey, id }
				if (!answerKeys.includes(answerKey)) {
					answerKeys.push(answerKey);

					// 2) Group answers by parentGroup
					const ans: IAns = {
						partitionKey,
						id,
						parentGroup,
						title,
						groupTitle: ''
					}
					if (!grouppAnswers.has(parentGroup)) {
						grouppAnswers.set(parentGroup, [ans]);
					}
					else {
						grouppAnswers.get(parentGroup)!.push(ans);
					}
				}
			})
		}
		catch (error: any) {
			console.debug(error)
		};

		////////////////////////////////////////////////////////////////////////////////
		// Search for Groups title words, and add all the answers of the Group
		/*
		if (answerKeys.length === 0) {
			try {
				const tx = this.dbp!.transaction('Answers')
				const index = tx.store.index('parentGroup_idx');
				const grpIdTitles = this.satisfyingGroups(searchWords)
				let i = 0;
				while (i < grpIdTitles.length) {
					const grpIdTitle = grpIdTitles[i];
					const parentGroup = grpIdTitle.id;
					for await (const cursor of index.iterate(parentGroup)) {
						const q: IAnswer = cursor.value;
						const { id, title } = q;
						//if (!answerRows.includes(id!))
						//	answerRows.push(id!);

						const answerKey = { parentGroup, id }
						if (!answerKeys.includes(answerKey)) {
							answerKeys.push(answerKey);

							//console.log(q);
							// 2) Group answers by parentGroup
							const ans: IAns = {
								id,
								parentGroup,
								title,
								groupTitle: grpIdTitle.title
							}
							if (!grpAnss.has(parentGroup)) {
								grpAnss.set(parentGroup, [ans]);
							}
							else {
								grpAnss.get(parentGroup)!.push(ans);
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

		if (answerKeys.length === 0)
			return [];

		try {
			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IAnswerRow[2]}
			// 1 = {'EDGE2' => IAnswerRow[3]}
			// 2 = {'EDGE3' => IAnswerRow[4]}4

			////////////////////////////////////////////////////////////
			// 
			let groupSections: IGroupSection[] = [];
			grouppAnswers.forEach((anss, id) => {
				const group = this.allGroups.get(id);
				const { title, titlesUpTheTree, variations } = group!;
				const groupSection: IGroupSection = {
					id: id,
					groupTitle: title,
					groupParentTitle: 'kuro',
					parentGroupUp: titlesUpTheTree!,
					anss: []
				};
				anss.forEach(ans => {
					// console.log(ans);
					if (variations.length > 0) {
						let wordsIncludesTag = false;
						// searchWords.forEach(w => {
						// 	variations.forEach(variation => {
						// 		if (variation === w.toUpperCase()) {
						// 			wordsIncludesTag = true;
						// 			grpSection.anss.push({ ...ans, title: ans.title + ' ' + variation });
						// 		}
						// 	})
						// })
						if (!wordsIncludesTag) {
							variations.forEach(variation => {
								// console.log(ans);
								groupSection.anss.push({ ...ans, title: ans.title + ' ' + variation });
							});
						}
					}
					else {
						groupSection.anss.push(ans);
					}
				});
				groupSections.push(groupSection);
				//console.log(grpSections)
			});
			return groupSections;
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

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IAns>): void {
		const answer: IAns = data.suggestion;
		// alert(`Selected answer is ${answer.answerId} (${answer.text}).`);
		this.props.onSelectAnswer({ partitionKey: answer.partitionKey, id: answer.id });
	}

	/*
	protected renderSuggestion(suggestion: Answer, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

	// TODO bac ovo u external css   style={{ textAlign: 'left'}}
	protected renderSuggestion(suggestion: IAns, params: Autosuggest.RenderSuggestionParams): JSX.Element {
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

	protected renderSectionTitle(section: IGrpMy): JSX.Element {
		const { parentGroupUp, groupParentTitle, groupTitle } = section;
		// let str = (groupParentTitle ? (groupParentTitle + " / ") : "") + groupTitle;
		// if (parentGroupUp)
		// 	str = " ... / " + str;
		return <strong>
			{parentGroupUp}
		</strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IAnswerShort>): JSX.Element {
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
	// 	let group = await this.dbp.get('Groups', id);
	// 	return { parentGroupTitle: group.title, parentGroupUp: '' };
	// }

	protected async onSuggestionsFetchRequested({ value }: any): Promise<void> {
		return /*await*/ this.debouncedLoadSuggestions(value);
	}

	private anyWord = (valueWordRegex: RegExp[], answerWords: string[]): boolean => {
		for (let valWordRegex of valueWordRegex)
			for (let answerWord of answerWords)
				if (valWordRegex.test(answerWord))
					return true;
		return false;
	}

	////////////////////////////////////
	// endregion region Helper methods

	protected getSuggestionValue(suggestion: IAns) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: IGrpMy) {
		return section.anss;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}