export function javaHash(s: string) {
    var hash = 0;
    for (var i = 0; i < s.length; i++) hash = (Math.imul(hash, 31) + s.charCodeAt(i)) | 0;
    return hash;
}
