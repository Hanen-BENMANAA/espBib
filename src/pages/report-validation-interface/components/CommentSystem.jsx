import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CommentSystem = ({
  reportData,
  comments = [],
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  currentUser,
  isReadOnly = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [commentType, setCommentType] = useState('feedback'); // feedback, revision, approval
  const [showRichEditor, setShowRichEditor] = useState(false);

  // Mock comments data
  const mockComments = [
  {
    id: 1,
    type: 'feedback',
    content: `La méthodologie présentée dans ce rapport est bien structurée, mais il serait bénéfique d'ajouter plus de détails sur les critères de sélection des participants à l'étude.\n\nDe plus, la section sur l'analyse des résultats pourrait être enrichie avec des graphiques comparatifs.`,
    author: {
      name: 'Dr. Marie Dubois', role: 'Enseignant', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11b715d60-1762273834012.png", avatarAlt: 'Professional headshot of middle-aged woman with brown hair in academic setting'
    },
    timestamp: new Date(Date.now() - 3600000),
    isVisible: true,
    attachments: [
    {
      name: 'suggestions_methodologie.pdf', size: '245 KB', type: 'pdf'
    }]

  },
  {
    id: 2,
    type: 'revision',
    content: `Révision requise pour les sections suivantes :\n\n1. Chapitre 3 : Revoir les références bibliographiques (format APA)\n2. Annexes : Ajouter les questionnaires utilisés\n3. Conclusion : Développer les perspectives d'amélioration`,
    author: {
      name: 'Prof. Jean Martin',
      role: 'Directeur de thèse',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f1f33c71-1762274731923.png",
      avatarAlt: 'Professional headshot of middle-aged man with glasses in academic office'
    },
    timestamp: new Date(Date.now() - 7200000),
    isVisible: true,
    priority: 'high'
  }];


  const allComments = [...mockComments, ...comments];

  const handleSubmitComment = () => {
    if (!newComment?.trim()) return;

    const comment = {
      id: Date.now(),
      type: commentType,
      content: newComment,
      author: currentUser || {
        name: 'Marie Dubois',
        role: 'Enseignant',
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11b715d60-1762273834012.png",
        avatarAlt: 'Professional headshot of middle-aged woman with brown hair in academic setting'
      },
      timestamp: new Date(),
      isVisible: commentType !== 'internal'
    };

    onAddComment(comment);
    setNewComment('');
    setCommentType('feedback');
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment?.id);
    setEditText(comment?.content);
  };

  const handleSaveEdit = () => {
    if (!editText?.trim()) return;

    onUpdateComment(editingComment, { content: editText });
    setEditingComment(null);
    setEditText('');
  };

  const getCommentTypeConfig = (type) => {
    const configs = {
      feedback: {
        label: 'Commentaire',
        icon: 'MessageSquare',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/20'
      },
      revision: {
        label: 'Révision requise',
        icon: 'AlertTriangle',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20'
      },
      approval: {
        label: 'Approbation',
        icon: 'CheckCircle',
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20'
      },
      internal: {
        label: 'Note interne',
        icon: 'Lock',
        color: 'text-neutral',
        bgColor: 'bg-muted',
        borderColor: 'border-border'
      }
    };
    return configs?.[type] || configs?.feedback;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `il y a ${minutes} min`;
    } else if (hours < 24) {
      return `il y a ${hours}h`;
    } else {
      return timestamp?.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-academic">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-medium text-text-primary flex items-center space-x-2">
            <Icon name="MessageSquare" size={20} className="text-accent" />
            <span>Commentaires et Feedback</span>
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-caption text-text-secondary">
              {allComments?.length} commentaire{allComments?.length !== 1 ? 's' : ''}
            </span>
            {!isReadOnly &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRichEditor(!showRichEditor)}
              className={showRichEditor ? 'bg-accent/10 text-accent' : ''}>

                <Icon name="Edit3" size={14} />
              </Button>
            }
          </div>
        </div>
      </div>
      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {allComments?.length === 0 ?
        <div className="p-8 text-center">
            <Icon name="MessageSquare" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary font-caption">
              Aucun commentaire pour le moment
            </p>
          </div> :

        <div className="p-4 space-y-4">
            {allComments?.map((comment) => {
            const typeConfig = getCommentTypeConfig(comment?.type);

            return (
              <div
                key={comment?.id}
                className={`border rounded-lg p-4 ${typeConfig?.bgColor} ${typeConfig?.borderColor}`}>

                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                        <img
                        src={comment?.author?.avatar}
                        alt={comment?.author?.avatarAlt}
                        className="w-full h-full object-cover" />

                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-text-primary text-sm">
                            {comment?.author?.name}
                          </span>
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-caption ${typeConfig?.bgColor} ${typeConfig?.color}`}>
                            <Icon name={typeConfig?.icon} size={12} />
                            <span>{typeConfig?.label}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-caption text-text-secondary">
                          <span>{comment?.author?.role}</span>
                          <span>•</span>
                          <span>{formatTimestamp(comment?.timestamp)}</span>
                          {comment?.priority === 'high' &&
                        <>
                              <span>•</span>
                              <span className="text-error font-medium">Priorité haute</span>
                            </>
                        }
                        </div>
                      </div>
                    </div>
                    
                    {!isReadOnly && comment?.author?.name === (currentUser?.name || 'Marie Dubois') &&
                  <div className="flex items-center space-x-1">
                        <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditComment(comment)}
                      className="h-8 w-8">

                          <Icon name="Edit2" size={14} />
                        </Button>
                        <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteComment(comment?.id)}
                      className="h-8 w-8 text-error hover:text-error">

                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                  }
                  </div>
                  {/* Comment Content */}
                  {editingComment === comment?.id ?
                <div className="space-y-3">
                      <textarea
                    value={editText}
                    onChange={(e) => setEditText(e?.target?.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    rows={4}
                    placeholder="Modifier le commentaire..." />

                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Sauvegarder
                        </Button>
                        <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingComment(null)}>

                          Annuler
                        </Button>
                      </div>
                    </div> :

                <div className="space-y-3">
                      <div className="text-sm text-text-primary whitespace-pre-wrap">
                        {comment?.content}
                      </div>
                      
                      {/* Attachments */}
                      {comment?.attachments && comment?.attachments?.length > 0 &&
                  <div className="space-y-2">
                          <span className="text-xs font-caption text-text-secondary">
                            Pièces jointes :
                          </span>
                          {comment?.attachments?.map((attachment, index) =>
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-background border border-border rounded-lg">

                              <Icon name="Paperclip" size={14} className="text-text-secondary" />
                              <span className="text-sm text-text-primary">{attachment?.name}</span>
                              <span className="text-xs font-caption text-text-secondary">
                                ({attachment?.size})
                              </span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                                <Icon name="Download" size={12} />
                              </Button>
                            </div>
                    )}
                        </div>
                  }
                    </div>
                }
                </div>);

          })}
          </div>
        }
      </div>
      {/* Add Comment Form */}
      {!isReadOnly &&
      <div className="p-4 border-t border-border bg-muted/30">
          <div className="space-y-3">
            {/* Comment Type Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-caption text-text-secondary">Type :</span>
              <div className="flex items-center space-x-2">
                {['feedback', 'revision', 'approval', 'internal']?.map((type) => {
                const config = getCommentTypeConfig(type);
                return (
                  <button
                    key={type}
                    onClick={() => setCommentType(type)}
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-caption transition-academic ${
                    commentType === type ?
                    `${config?.bgColor} ${config?.color} border ${config?.borderColor}` :
                    'bg-background text-text-secondary border border-border hover:bg-muted'}`
                    }>

                      <Icon name={config?.icon} size={12} />
                      <span>{config?.label}</span>
                    </button>);

              })}
              </div>
            </div>

            {/* Comment Input */}
            <div className="space-y-2">
              <textarea
              value={newComment}
              onChange={(e) => setNewComment(e?.target?.value)}
              placeholder="Ajouter un commentaire détaillé..."
              className="w-full p-3 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              rows={showRichEditor ? 6 : 3} />

              
              {/* Rich Editor Tools */}
              {showRichEditor &&
            <div className="flex items-center space-x-2 p-2 bg-background border border-border rounded-lg">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icon name="Bold" size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icon name="Italic" size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icon name="List" size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icon name="Link" size={14} />
                  </Button>
                  <div className="border-l border-border h-6 mx-2" />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icon name="Paperclip" size={14} />
                  </Button>
                </div>
            }
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-caption text-text-secondary">
                {commentType === 'internal' ?
              <span className="flex items-center space-x-1">
                    <Icon name="Lock" size={12} />
                    <span>Visible uniquement par les enseignants</span>
                  </span> :

              <span>Visible par l'étudiant et les enseignants</span>
              }
              </div>
              
              <Button
              onClick={handleSubmitComment}
              disabled={!newComment?.trim()}
              iconName="Send"
              iconPosition="right"
              iconSize={14}>

                Publier
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default CommentSystem;