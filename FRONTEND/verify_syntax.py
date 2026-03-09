
def check_braces(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    pairs = {'{': '}', '[': ']', '(': ')'}
    quotes = {'"': '"', "'": "'", '`': '`'}
    
    in_string = None
    in_comment = False
    
    i = 0
    while i < len(content):
        char = content[i]
        
        if in_comment:
            if char == '\n' and in_comment == 'single':
                in_comment = False
            elif char == '*' and i + 1 < len(content) and content[i+1] == '/' and in_comment == 'multi':
                in_comment = False
                i += 1
            i += 1
            continue
            
        if in_string:
            if char == in_string and content[i-1] != '\\':
                in_string = None
            i += 1
            continue
            
        if char == '/' and i + 1 < len(content):
            if content[i+1] == '/':
                in_comment = 'single'
                i += 2
                continue
            elif content[i+1] == '*':
                in_comment = 'multi'
                i += 2
                continue
        
        if char in quotes:
            in_string = char
            i += 1
            continue
            
        if char in pairs:
            stack.append((char, i))
        elif char in pairs.values():
            if not stack:
                print(f"Extra closing {char} at index {i}")
                # return
            else:
                opening, pos = stack.pop()
                if pairs[opening] != char:
                    line = content.count('\n', 0, i) + 1
                    print(f"Mismatch: {opening} at index {pos} closed with {char} at line {line}")
                    # return
        i += 1
    
    if stack:
        print("Unbalanced openings:")
        for char, pos in stack:
            # Find line number
            line = content.count('\n', 0, pos) + 1
            print(f"  {char} at line {line}")
    else:
        print("All clear!")

if __name__ == "__main__":
    check_braces(r"c:\Users\ALI REHAN ARSHAD\Desktop\my-voice-app\src\components\pages\ChatPage.jsx")
