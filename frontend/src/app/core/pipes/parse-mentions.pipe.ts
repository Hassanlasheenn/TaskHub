import { Pipe, PipeTransform } from "@angular/core";

export type CommentSegment = { type: 'text' | 'mention' | 'image'; value: string };

@Pipe({
    name: 'parseMentions',
    standalone: true,
})
export class ParseMentionsPipe implements PipeTransform {
    transform(content: string | undefined): CommentSegment[] {
        if (content == null || content === '') return [];

        // Regex to split by either @mention or ![image](url)
        const parts = content.split(/(@\w+)|(!\[image\]\([^)]+\))/g);
        
        return parts
            .filter(p => p !== undefined && p !== '')
            .map((p): CommentSegment => {
                if (p.startsWith('@')) {
                    return { type: 'mention', value: p };
                }
                if (p.startsWith('![image]')) {
                    // Extract URL from ![image](URL)
                    const url = p.match(/\(([^)]+)\)/)?.[1] || '';
                    return { type: 'image', value: url };
                }
                return { type: 'text', value: p };
            });
    }
}
