// src/pages/Surveys/components/QuestionList.jsx
// ============================================================================
// Shared drag-and-drop question list used by both survey and template modes.
// Wraps react-beautiful-dnd and renders QuestionCard for each question.
// Extracted from SurveyBuilder.jsx renderSurveyDetailsStep (L2027-2198).
// ============================================================================

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    MdAdd,
    MdAutoAwesome,
    MdTune,
    MdViewList
} from 'react-icons/md';
import QuestionCard from './QuestionCard';

const QuestionList = ({
    questions,
    questionTypes,
    onDragEnd,
    onEdit,
    onDuplicate,
    onDelete,
    onOpenAIModal,
    onSuggestQuestion,
    onOptimize,
    isGeneratingAI
}) => {
    return (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] font-semibold">
                <div className="flex items-center">
                    <MdViewList className="mr-2" />
                    <strong>Questions ({questions.length})</strong>
                </div>
                <div className="flex items-center gap-2">
                    {questions.length > 0 && (
                        <>
                            <button
                                type="button"
                                onClick={onSuggestQuestion}
                                disabled={isGeneratingAI}
                                className="inline-flex items-center px-2.5 py-1 text-sm border border-blue-400 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                                <MdAutoAwesome className="mr-1" />
                                {isGeneratingAI ? <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></span> : 'Suggest'}
                            </button>

                            <button
                                type="button"
                                onClick={onOptimize}
                                disabled={isGeneratingAI}
                                className="inline-flex items-center px-2.5 py-1 text-sm border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50"
                            >
                                <MdTune className="mr-1" />
                                {isGeneratingAI ? <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></span> : 'Optimize'}
                            </button>
                        </>
                    )}
                    {questions.length > 0 && (
                        <small className="text-muted">Drag to reorder</small>
                    )}
                </div>
            </div>
            <div className="p-0">
                {questions.length === 0 ? (
                    <div className="text-center py-10">
                        <MdAdd size={48} className="text-muted mb-3 mx-auto" />
                        <h5 className="font-semibold">No Questions Yet</h5>
                        <p className="text-muted mb-4">
                            Add questions from the sidebar or use AI to generate a complete survey
                        </p>
                        <button
                            type="button"
                            onClick={onOpenAIModal}
                            className="inline-flex items-center px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors mx-auto"
                        >
                            <MdAutoAwesome className="mr-2" />
                            Generate with AI
                        </button>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="questions">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {questions.map((question, index) => (
                                        <Draggable
                                            key={question.id}
                                            draggableId={question.id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <QuestionCard
                                                    question={question}
                                                    index={index}
                                                    questionTypes={questionTypes}
                                                    provided={provided}
                                                    snapshot={snapshot}
                                                    onEdit={onEdit}
                                                    onDuplicate={onDuplicate}
                                                    onDelete={onDelete}
                                                />
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
        </div>
    );
};

export default QuestionList;
