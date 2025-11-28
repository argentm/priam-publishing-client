'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Music, UserCircle, Radio, Settings, XCircle } from 'lucide-react';
import type { ReviewStepProps } from './types';
import { WRITER_ROLES, LANGUAGES, WORK_CATEGORIES, VERSION_TYPES } from './constants';

export function ReviewStep({
  workData,
  detailsData,
  writers,
  linkedTracks,
  saving,
  error,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  const totalShare = writers.reduce((sum, w) => sum + (w.share || 0), 0);

  // Get display labels for select values
  const getLanguageLabel = (value?: string) =>
    LANGUAGES.find((l) => l.value === value)?.label || value;
  const getCategoryLabel = (value?: string) =>
    WORK_CATEGORIES.find((c) => c.value === value)?.label || value;
  const getVersionLabel = (value?: string) =>
    VERSION_TYPES.find((v) => v.value === value)?.label || value;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Review Your Work</CardTitle>
          <CardDescription>Please review all the information before submitting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Work Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Work Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Title</span>
                <p className="font-medium">{workData.title}</p>
              </div>
              {workData.iswc && (
                <div>
                  <span className="text-muted-foreground">ISWC</span>
                  <p className="font-mono">{workData.iswc}</p>
                </div>
              )}
              {workData.tunecode && (
                <div>
                  <span className="text-muted-foreground">Tunecode</span>
                  <p className="font-mono">{workData.tunecode}</p>
                </div>
              )}
            </div>
            {(workData.priority || workData.productionLibrary || workData.grandRights) && (
              <div className="flex gap-2">
                {workData.priority && <Badge>Priority</Badge>}
                {workData.productionLibrary && <Badge variant="secondary">Production Library</Badge>}
                {workData.grandRights && <Badge variant="outline">Grand Rights</Badge>}
              </div>
            )}
          </div>

          <hr />

          {/* Writers Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              Writers ({writers.length})
            </h3>
            <div className="space-y-3">
              {writers.map((writer) => {
                const roleObj = WRITER_ROLES.find((r) => r.value === writer.role);
                return (
                  <div
                    key={writer.tempId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          writer.isControlled ? 'bg-primary/10 text-primary' : 'bg-muted'
                        }`}
                      >
                        <UserCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{writer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {roleObj?.label || writer.role} •{' '}
                          {writer.isControlled ? 'Controlled' : 'Uncontrolled'}
                          {writer.isNew && ' • New'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-bold">{writer.share}%</p>
                      <p className="text-xs text-muted-foreground">Share</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-6 text-sm font-medium">
              <span className="text-green-600">Total: {totalShare}%</span>
            </div>
          </div>

          {/* Recordings Summary */}
          {linkedTracks.length > 0 && (
            <>
              <hr />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />
                  Linked Recordings ({linkedTracks.length})
                </h3>
                <div className="space-y-2">
                  {linkedTracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <Radio className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {track.isrc && <span>ISRC: {track.isrc}</span>}
                          {track.artist && <span> • {track.artist}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Performers Summary */}
          {(detailsData.performers?.length ?? 0) > 0 && (
            <>
              <hr />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Performers ({detailsData.performers?.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detailsData.performers?.map((performer) => (
                    <Badge key={performer} variant="secondary">
                      {performer}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Details Summary */}
          {(detailsData.workLanguage ||
            detailsData.workDescriptionCategory ||
            detailsData.versionType ||
            detailsData.duration ||
            detailsData.foreignId ||
            detailsData.copyrightDate) && (
            <>
              <hr />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Additional Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {detailsData.workLanguage && (
                    <div>
                      <span className="text-muted-foreground">Language</span>
                      <p className="font-medium">{getLanguageLabel(detailsData.workLanguage)}</p>
                    </div>
                  )}
                  {detailsData.workDescriptionCategory && (
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="font-medium">
                        {getCategoryLabel(detailsData.workDescriptionCategory)}
                      </p>
                    </div>
                  )}
                  {detailsData.versionType && (
                    <div>
                      <span className="text-muted-foreground">Version</span>
                      <p className="font-medium">{getVersionLabel(detailsData.versionType)}</p>
                    </div>
                  )}
                  {detailsData.duration && (
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">
                        {Math.floor(detailsData.duration / 60)}:
                        {String(detailsData.duration % 60).padStart(2, '0')}
                      </p>
                    </div>
                  )}
                  {detailsData.foreignId && (
                    <div>
                      <span className="text-muted-foreground">Foreign ID</span>
                      <p className="font-mono text-xs">{detailsData.foreignId}</p>
                    </div>
                  )}
                  {detailsData.copyrightDate && (
                    <div>
                      <span className="text-muted-foreground">Copyright Date</span>
                      <p className="font-medium">{detailsData.copyrightDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onSubmit} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Creating Work...' : 'Create Work'}
        </Button>
      </div>
    </div>
  );
}
